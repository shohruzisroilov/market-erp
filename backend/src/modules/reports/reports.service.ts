import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { calculateStockBreakdown } from '../../common/utils/stock.util.js';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Ombordagi to'liq qoldiqlar hisoboti (Dona va Blokda, joylashuvi bilan)
  async getStockReport() {
    const products = await this.prisma.product.findMany({
      include: {
        stockItems: {
          include: {
            subWarehouse: {
              include: { warehouse: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    let overallTotalCost = 0;
    let overallTotalSell = 0;
    let overallTotalUnits = 0;

    const report = products.map((product) => {
      const totalUnits = product.stockItems.reduce(
        (sum, item) => sum + item.quantityInUnits,
        0,
      );
      const breakdown = calculateStockBreakdown(totalUnits, product.pcsPerPack);
      const totalCostValue = totalUnits * product.costPrice;
      const totalSellValue = totalUnits * product.sellPriceUnit;

      overallTotalCost += totalCostValue;
      overallTotalSell += totalSellValue;
      overallTotalUnits += totalUnits;

      const subWarehouseLocations = product.stockItems
        .filter((item) => item.quantityInUnits > 0)
        .map((item) => ({
          subWarehouseId: item.subWarehouseId,
          subWarehouseName: item.subWarehouse.name,
          warehouseName: item.subWarehouse.warehouse.name,
          quantityInUnits: item.quantityInUnits,
          ...calculateStockBreakdown(item.quantityInUnits, product.pcsPerPack),
          costValue: item.quantityInUnits * product.costPrice,
        }));

      return {
        productId: product.id,
        productName: product.name,
        category: product.category,
        barcode: product.barcode,
        pcsPerPack: product.pcsPerPack,
        costPrice: product.costPrice,
        sellPriceUnit: product.sellPriceUnit,
        sellPricePack: product.sellPricePack,
        minStockAlert: product.minStockAlert,
        ...breakdown,
        totalCostValue,
        totalSellValue,
        potentialProfit: totalSellValue - totalCostValue,
        isLowStock: totalUnits <= product.minStockAlert,
        locations: subWarehouseLocations,
      };
    });

    return {
      summary: {
        totalProductsCount: products.length,
        overallTotalUnits,
        overallTotalCost,
        overallTotalSell,
        overallPotentialProfit: overallTotalSell - overallTotalCost,
      },
      products: report,
    };
  }

  // 2. Savdolar hisoboti
  async getSalesReport(startDate?: string, endDate?: string) {
    const dateFilter: Record<string, any> = { status: 'COMPLETED' };
    if (startDate || endDate) {
      dateFilter.completedAt = {};
      if (startDate) dateFilter.completedAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.completedAt.lte = end;
      }
    }

    const sales = await this.prisma.saleInvoice.findMany({
      where: dateFilter,
      include: {
        items: {
          include: { product: true },
        },
        subWarehouse: {
          include: { warehouse: true },
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    const totalSalesAmount = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalCostAmount = sales.reduce((sum, s) => sum + s.totalCostAmount, 0);
    const totalGrossProfit = totalSalesAmount - totalCostAmount;
    const totalOrders = sales.length;
    const averageOrderValue = totalOrders > 0 ? totalSalesAmount / totalOrders : 0;

    // Eng ko'p sotilgan tovarlar reytingi
    const productStats = new Map<
      string,
      { name: string; category: string; unitsSold: number; totalRevenue: number; profit: number; pcsPerPack: number }
    >();

    for (const sale of sales) {
      for (const item of sale.items) {
        const existing = productStats.get(item.productId) || {
          name: item.product.name,
          category: item.product.category,
          unitsSold: 0,
          totalRevenue: 0,
          profit: 0,
          pcsPerPack: item.product.pcsPerPack,
        };
        existing.unitsSold += item.totalUnits;
        existing.totalRevenue += item.totalAmount;
        existing.profit += item.totalAmount - item.totalCostAtSale;
        productStats.set(item.productId, existing);
      }
    }

    const topSellingProducts = Array.from(productStats.values())
      .map((p) => ({
        ...p,
        ...calculateStockBreakdown(p.unitsSold, p.pcsPerPack),
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    return {
      summary: {
        totalOrders,
        totalSalesAmount,
        totalCostAmount,
        totalGrossProfit,
        profitMarginPercent:
          totalSalesAmount > 0 ? (totalGrossProfit / totalSalesAmount) * 100 : 0,
        averageOrderValue,
      },
      topSellingProducts,
      recentSales: sales.slice(0, 20),
    };
  }

  // 3. To'liq P&L (Foyda va Zarar) Hisoboti
  async getPnlReport(startDate?: string, endDate?: string) {
    const dateFilter: Record<string, any> = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.createdAt.lte = end;
      }
    }

    // 1. Savdo tushumi va Sotilgan tovarlar tannarxi (COGS)
    const sales = await this.prisma.saleInvoice.findMany({
      where: {
        status: 'COMPLETED',
        ...(dateFilter.createdAt ? { completedAt: dateFilter.createdAt } : {}),
      },
    });

    const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalCogs = sales.reduce((sum, s) => sum + s.totalCostAmount, 0);
    const grossProfit = totalRevenue - totalCogs;

    // 2. Operatsion xarajatlar (OPEX)
    const expenseTransactions = await this.prisma.cashTransaction.findMany({
      where: {
        category: 'OPERATING',
        direction: 'OUT',
        ...dateFilter,
      },
    });

    let transportExpense = 0; // Yo'l kira
    let rentExpense = 0;      // Ijara
    let salaryExpense = 0;    // Ish haqi
    let utilitiesExpense = 0; // Kommunal
    let otherExpense = 0;     // Boshqa

    for (const tx of expenseTransactions) {
      if (tx.type === 'EXPENSE_TRANSPORT') transportExpense += tx.amount;
      else if (tx.type === 'EXPENSE_RENT') rentExpense += tx.amount;
      else if (tx.type === 'EXPENSE_SALARY') salaryExpense += tx.amount;
      else if (tx.type === 'EXPENSE_UTILITIES') utilitiesExpense += tx.amount;
      else otherExpense += tx.amount;
    }

    const totalOperatingExpenses =
      transportExpense + rentExpense + salaryExpense + utilitiesExpense + otherExpense;

    // 3. Boshqa operatsion daromadlar
    const otherIncomes = await this.prisma.cashTransaction.findMany({
      where: {
        type: 'OTHER_INCOME',
        ...dateFilter,
      },
    });
    const totalOtherIncome = otherIncomes.reduce((sum, tx) => sum + tx.amount, 0);

    // 4. Inventarizatsiya natijalari (Kamomad yoki Ortiqchalik)
    const audits = await this.prisma.inventoryAudit.findMany({
      where: {
        status: 'COMPLETED',
        ...(dateFilter.createdAt ? { completedAt: dateFilter.createdAt } : {}),
      },
    });

    let inventoryDeficit = 0; // Kamomad (zarar)
    let inventorySurplus = 0; // Ortiqcha (daromad)

    for (const a of audits) {
      if (a.totalDifferenceValue < 0) {
        inventoryDeficit += Math.abs(a.totalDifferenceValue);
      } else if (a.totalDifferenceValue > 0) {
        inventorySurplus += a.totalDifferenceValue;
      }
    }

    // 5. SOF FOYDA (Net Profit)
    // Formula: Gross Profit - OPEX - Deficit + Surplus + OtherIncome
    const netProfit =
      grossProfit -
      totalOperatingExpenses -
      inventoryDeficit +
      inventorySurplus +
      totalOtherIncome;

    // 6. Qarz harakatlari (Cash Flow / Balance Sheet - sof foydaga kirmaydi, lekin biznes ko'rsatkichi uchun muhim)
    const financingTransactions = await this.prisma.cashTransaction.findMany({
      where: {
        category: 'FINANCING',
        ...dateFilter,
      },
    });

    let debtGiven = 0;     // Berilgan qarz
    let debtCollected = 0; // Qaytarib olingan qarz
    let debtTaken = 0;     // Olingan qarz
    let debtRepaid = 0;    // To'langan qarz

    for (const tx of financingTransactions) {
      if (tx.type === 'DEBT_GIVEN') debtGiven += tx.amount;
      else if (tx.type === 'DEBT_COLLECTED') debtCollected += tx.amount;
      else if (tx.type === 'DEBT_TAKEN') debtTaken += tx.amount;
      else if (tx.type === 'DEBT_REPAID') debtRepaid += tx.amount;
    }

    return {
      period: {
        startDate: startDate || 'Boshidan boshlab',
        endDate: endDate || 'Hozirgacha',
      },
      pnl: {
        revenue: totalRevenue,
        cogs: totalCogs,
        grossProfit,
        grossMarginPercent: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,

        operatingExpenses: {
          transport: transportExpense,
          rent: rentExpense,
          salary: salaryExpense,
          utilities: utilitiesExpense,
          other: otherExpense,
          total: totalOperatingExpenses,
        },

        inventoryAdjustments: {
          deficit: inventoryDeficit,
          surplus: inventorySurplus,
          netImpact: inventorySurplus - inventoryDeficit,
        },

        otherIncome: totalOtherIncome,

        netProfit,
        netMarginPercent: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
      },
      financingAndDebtFlow: {
        debtGiven,
        debtCollected,
        debtTaken,
        debtRepaid,
        explanation:
          'Qarz berish va olish operatsiyalari aktiv/majburiyat hisoblanadi va Sof Foydani (P&L) o\'zgartirmaydi, lekin kassa aylanmasiga ta\'sir qiladi.',
      },
    };
  }
}
