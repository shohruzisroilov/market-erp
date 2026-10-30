import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateWarehouseDto, CreateSubWarehouseDto } from './dto/warehouse.dto.js';
import { calculateStockBreakdown } from '../../common/utils/stock.util.js';

@Injectable()
export class WarehousesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllWarehouses() {
    const warehouses = await this.prisma.warehouse.findMany({
      include: {
        subWarehouses: {
          include: {
            stockItems: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return warehouses.map((wh) => {
      const subWarehouses = wh.subWarehouses.map((sub) => {
        const totalUnits = sub.stockItems.reduce((acc, s) => acc + s.quantityInUnits, 0);
        return {
          id: sub.id,
          name: sub.name,
          description: sub.description,
          warehouseId: sub.warehouseId,
          totalProductsCount: sub.stockItems.filter((s) => s.quantityInUnits > 0).length,
          totalUnits,
        };
      });

      return {
        ...wh,
        subWarehouses,
      };
    });
  }

  async findAllSubWarehouses() {
    return this.prisma.subWarehouse.findMany({
      include: {
        warehouse: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getSubWarehouseStock(subWarehouseId: string) {
    const subWarehouse = await this.prisma.subWarehouse.findUnique({
      where: { id: subWarehouseId },
      include: {
        warehouse: true,
        stockItems: {
          include: {
            product: true,
          },
          orderBy: {
            product: { name: 'asc' },
          },
        },
      },
    });

    if (!subWarehouse) {
      throw new NotFoundException(`Sub-ombor topilmadi: ${subWarehouseId}`);
    }

    const items = subWarehouse.stockItems.map((item) => {
      const breakdown = calculateStockBreakdown(
        item.quantityInUnits,
        item.product.pcsPerPack,
      );
      const totalCostValue = item.quantityInUnits * item.product.costPrice;
      const totalSellValue = item.quantityInUnits * item.product.sellPriceUnit;

      return {
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        category: item.product.category,
        barcode: item.product.barcode,
        pcsPerPack: item.product.pcsPerPack,
        costPrice: item.product.costPrice,
        sellPriceUnit: item.product.sellPriceUnit,
        sellPricePack: item.product.sellPricePack,
        quantityInUnits: item.quantityInUnits,
        ...breakdown,
        totalCostValue,
        totalSellValue,
        isLowStock: item.quantityInUnits <= item.product.minStockAlert,
      };
    });

    const totalStockCost = items.reduce((sum, i) => sum + i.totalCostValue, 0);
    const totalStockSell = items.reduce((sum, i) => sum + i.totalSellValue, 0);

    return {
      subWarehouse: {
        id: subWarehouse.id,
        name: subWarehouse.name,
        description: subWarehouse.description,
        warehouseName: subWarehouse.warehouse.name,
      },
      items,
      totalStockCost,
      totalStockSell,
    };
  }

  async createWarehouse(dto: CreateWarehouseDto) {
    return this.prisma.warehouse.create({
      data: {
        name: dto.name,
        address: dto.address,
        isDefault: dto.isDefault ?? false,
      },
    });
  }

  async createSubWarehouse(dto: CreateSubWarehouseDto) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id: dto.warehouseId },
    });
    if (!warehouse) {
      throw new NotFoundException(`Asosiy ombor topilmadi: ${dto.warehouseId}`);
    }

    return this.prisma.subWarehouse.create({
      data: {
        warehouseId: dto.warehouseId,
        name: dto.name,
        description: dto.description,
      },
    });
  }
}

