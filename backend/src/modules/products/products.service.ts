import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { calculateStockBreakdown } from '../../common/utils/stock.util.js';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const products = await this.prisma.product.findMany({
      include: {
        stockItems: {
          include: {
            subWarehouse: {
              include: {
                warehouse: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return products.map((product) => {
      const totalUnits = product.stockItems.reduce(
        (sum, item) => sum + item.quantityInUnits,
        0,
      );
      const stockBreakdown = calculateStockBreakdown(totalUnits, product.pcsPerPack);

      const subWarehouseStock = product.stockItems.map((item) => ({
        subWarehouseId: item.subWarehouseId,
        subWarehouseName: item.subWarehouse.name,
        warehouseName: item.subWarehouse.warehouse.name,
        quantityInUnits: item.quantityInUnits,
        ...calculateStockBreakdown(item.quantityInUnits, product.pcsPerPack),
      }));

      return {
        ...product,
        ...stockBreakdown,
        isLowStock: totalUnits <= product.minStockAlert,
        subWarehouseStock,
      };
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        stockItems: {
          include: {
            subWarehouse: {
              include: {
                warehouse: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Mahsulot topilmadi: ${id}`);
    }

    const totalUnits = product.stockItems.reduce(
      (sum, item) => sum + item.quantityInUnits,
      0,
    );
    const stockBreakdown = calculateStockBreakdown(totalUnits, product.pcsPerPack);

    const subWarehouseStock = product.stockItems.map((item) => ({
      subWarehouseId: item.subWarehouseId,
      subWarehouseName: item.subWarehouse.name,
      warehouseName: item.subWarehouse.warehouse.name,
      quantityInUnits: item.quantityInUnits,
      ...calculateStockBreakdown(item.quantityInUnits, product.pcsPerPack),
    }));

    return {
      ...product,
      ...stockBreakdown,
      isLowStock: totalUnits <= product.minStockAlert,
      subWarehouseStock,
    };
  }

  async create(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        name: dto.name,
        category: dto.category,
        barcode: dto.barcode || null,
        pcsPerPack: dto.pcsPerPack,
        costPrice: dto.costPrice,
        sellPriceUnit: dto.sellPriceUnit,
        sellPricePack: dto.sellPricePack,
        minStockAlert: dto.minStockAlert ?? 24,
      },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
