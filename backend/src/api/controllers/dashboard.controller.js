const { PrismaClient } = require('@prisma/client');
const stockService = require('../../services/stock.service');

const prisma = new PrismaClient();

/**
 * @desc    Get dashboard KPIs
 * @route   GET /api/dashboard/kpis
 */
exports.getKPIs = async (req, res, next) => {
  try {
    // Parallel queries for performance
    const [
      totalProducts,
      totalLocations,
      pendingReceipts,
      pendingDeliveries,
      lowStockAlerts,
      recentMoves
    ] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.location.count({ where: { isActive: true } }),
      prisma.stockLedger.count({
        where: { documentType: 'RECEIPT', status: 'DRAFT' }
      }),
      prisma.stockLedger.count({
        where: { documentType: 'DELIVERY', status: 'DRAFT' }
      }),
      stockService.getLowStockAlerts(),
      stockService.getStockLedger({ limit: 10 })
    ]);

    // Calculate stock values
    const stockLevels = await stockService.getStockLevels();
    
    const totalStockItems = stockLevels.reduce((sum, stock) => sum + stock.onHandQuantity, 0);
    
    const totalStockValue = stockLevels.reduce((sum, stock) => {
      const cost = stock.product.unitCost || 0;
      return sum + (stock.onHandQuantity * cost);
    }, 0);

    const reservedValue = stockLevels.reduce((sum, stock) => {
      const cost = stock.product.unitCost || 0;
      return sum + (stock.reservedQuantity * cost);
    }, 0);

    const availableValue = stockLevels.reduce((sum, stock) => {
      const cost = stock.product.unitCost || 0;
      return sum + (stock.availableQuantity * cost);
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalLocations,
        pendingReceipts,
        pendingDeliveries,
        lowStockCount: lowStockAlerts.length,
        totalStockItems: Math.round(totalStockItems),
        totalStockValue,
        reservedValue,
        availableValue,
        recentMoves
      }
    });
  } catch (error) {
    next(error);
  }
};
