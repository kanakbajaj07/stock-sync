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
      recentMoves,
      stockLevels
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
      stockService.getStockLedger({ limit: 10 }),
      stockService.getStockLevels() // Fetches all stock with product info
    ]);

    // 1. Calculate Overall Stock Values
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

    // 2. Prepare Chart Data: Stock Value by Category
    const categoryMap = stockLevels.reduce((acc, stock) => {
      const cat = stock.product.category;
      const val = stock.onHandQuantity * (stock.product.unitCost || 0);
      if (!acc[cat]) {
        acc[cat] = { name: cat, value: 0 };
      }
      acc[cat].value += val;
      return acc;
    }, {});
    const stockValueByCategory = Object.values(categoryMap).sort((a, b) => b.value - a.value);

    // 3. Prepare Chart Data: Movements (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const movements = await prisma.stockLedger.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        status: 'VALIDATED'
      },
      select: {
        createdAt: true,
        documentType: true,
        quantity: true
      }
    });

    // Group movements by date
    const movementsMap = {};
    // Initialize last 7 days
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
      movementsMap[dateStr] = { date: dateStr, receipts: 0, deliveries: 0 };
    }

    movements.forEach(move => {
      const dateStr = move.createdAt.toISOString().split('T')[0];
      if (movementsMap[dateStr]) {
        if (move.documentType === 'RECEIPT') {
          movementsMap[dateStr].receipts += move.quantity;
        } else if (move.documentType === 'DELIVERY') {
          movementsMap[dateStr].deliveries += move.quantity;
        }
      }
    });

    const movementsChart = Object.values(movementsMap).sort((a, b) => a.date.localeCompare(b.date));

    res.status(200).json({
      success: true,
      data: {
        // KPIs
        totalProducts,
        totalLocations,
        pendingReceipts,
        pendingDeliveries,
        lowStockCount: lowStockAlerts.length,
        totalStockItems: Math.round(totalStockItems),
        totalStockValue,
        reservedValue,
        availableValue,
        recentMoves,
        // Charts
        charts: {
          stockValueByCategory,
          movements: movementsChart
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
