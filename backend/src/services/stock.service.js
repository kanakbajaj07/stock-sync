const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Core Stock Service - Handles all stock level operations with transactional integrity
 */
class StockService {
  /**
   * Validate and execute a stock operation (Receipt, Delivery, or Transfer)
   * This is the CRITICAL function that updates stock levels and creates ledger entries
   * 
   * @param {Object} operation - Stock operation details
   * @returns {Promise<Object>} - Updated operation with stock changes
   */
  async validateOperation(operation) {
    const {
      moveId,
      productId,
      sourceLocationId,
      destinationLocationId,
      quantity,
      documentType,
      userId
    } = operation;

    // Use Prisma transaction to ensure atomicity
    return await prisma.$transaction(async (tx) => {
      // 1. Update the ledger entry status to VALIDATED
      const updatedLedger = await tx.stockLedger.update({
        where: { id: moveId },
        data: {
          status: 'VALIDATED',
          validatedAt: new Date()
        }
      });

      // 2. Update stock levels based on document type
      switch (documentType) {
        case 'RECEIPT':
          // INCREASE stock at destination
          await this._increaseStock(tx, productId, destinationLocationId, quantity);
          break;

        case 'DELIVERY':
          // DECREASE stock at source
          await this._decreaseStock(tx, productId, sourceLocationId, quantity);
          break;

        case 'INTERNAL_TRANSFER':
          // DECREASE at source, INCREASE at destination
          await this._decreaseStock(tx, productId, sourceLocationId, quantity);
          await this._increaseStock(tx, productId, destinationLocationId, quantity);
          break;

        case 'ADJUSTMENT':
          // Handle based on whether it's increasing or decreasing
          if (quantity > 0) {
            await this._increaseStock(tx, productId, destinationLocationId, Math.abs(quantity));
          } else {
            await this._decreaseStock(tx, productId, sourceLocationId, Math.abs(quantity));
          }
          break;

        default:
          throw new Error(`Unknown document type: ${documentType}`);
      }

      // 3. Return the updated ledger entry with relations
      return await tx.stockLedger.findUnique({
        where: { id: moveId },
        include: {
          product: true,
          sourceLocation: true,
          destinationLocation: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });
    });
  }

  /**
   * Increase stock at a location
   * @private
   */
  async _increaseStock(tx, productId, locationId, quantity) {
    // Check if stock level exists
    const existingStock = await tx.stockLevel.findUnique({
      where: {
        productId_locationId: {
          productId,
          locationId
        }
      }
    });

    if (existingStock) {
      // Update existing stock
      // New OnHand = Old OnHand + Quantity
      // New Available = New OnHand - Reserved
      const newOnHand = existingStock.onHandQuantity + quantity;
      
      await tx.stockLevel.update({
        where: {
          productId_locationId: {
            productId,
            locationId
          }
        },
        data: {
          onHandQuantity: newOnHand,
          availableQuantity: newOnHand - existingStock.reservedQuantity
        }
      });
    } else {
      // Create new stock level
      await tx.stockLevel.create({
        data: {
          productId,
          locationId,
          onHandQuantity: quantity,
          availableQuantity: quantity, // Initial available = onHand (reserved is 0 default)
          reservedQuantity: 0
        }
      });
    }
  }

  /**
   * Decrease stock at a location
   * @private
   */
  async _decreaseStock(tx, productId, locationId, quantity) {
    const existingStock = await tx.stockLevel.findUnique({
      where: {
        productId_locationId: {
          productId,
          locationId
        }
      }
    });

    if (!existingStock) {
      throw new Error(`No stock found for product at location`);
    }

    if (existingStock.onHandQuantity < quantity) {
      throw new Error(
        `Insufficient stock. Available: ${existingStock.onHandQuantity}, Required: ${quantity}`
      );
    }

    // New OnHand = Old OnHand - Quantity
    // New Available = New OnHand - Reserved
    const newOnHand = existingStock.onHandQuantity - quantity;

    await tx.stockLevel.update({
      where: {
        productId_locationId: {
          productId,
          locationId
        }
      },
      data: {
        onHandQuantity: newOnHand,
        availableQuantity: newOnHand - existingStock.reservedQuantity
      }
    });
  }

  /**
   * Get current stock levels with optional filters
   */
  async getStockLevels(filters = {}) {
    const { productId, locationId, minQuantity } = filters;

    const where = {};
    if (productId) where.productId = productId;
    if (locationId) where.locationId = locationId;
    if (minQuantity !== undefined) {
      where.onHandQuantity = { gte: minQuantity };
    }

    return await prisma.stockLevel.findMany({
      where,
      include: {
        product: true,
        location: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
  }

  /**
   * Get stock ledger history with filters
   */
  async getStockLedger(filters = {}) {
    const { productId, locationId, documentType, status, limit = 50 } = filters;

    const where = {};
    if (productId) where.productId = productId;
    if (documentType) where.documentType = documentType;
    if (status) where.status = status;
    if (locationId) {
      where.OR = [
        { sourceLocationId: locationId },
        { destinationLocationId: locationId }
      ];
    }

    return await prisma.stockLedger.findMany({
      where,
      include: {
        product: true,
        sourceLocation: true,
        destinationLocation: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });
  }

  /**
   * Get low stock alerts (below reorder level)
   */
  async getLowStockAlerts() {
    const stockLevels = await prisma.stockLevel.findMany({
      include: {
        product: true,
        location: true
      }
    });

    // Filter for products below reorder level
    return stockLevels.filter(stock => {
      return stock.product.reorderLevel && stock.onHandQuantity <= stock.product.reorderLevel;
    });
  }
}

module.exports = new StockService();
