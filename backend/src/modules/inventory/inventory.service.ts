import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateInventoryAuditDto } from './dto/inventory.dto.js';
import { calculateStockBreakdown } from '../../common/utils/stock.util.js';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const audits = await this.prisma.inventoryAudit.findMany({
      include: {
        subWarehouse: {
          include: { warehouse: true },
        },
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return audits.map((audit) => ({
      ...audit,
      items: audit.items.map((item) => ({
        ...item,
        systemBreakdown: calculateStockBreakdown(
          item.systemQuantity,
          item.product.pcsPerPack,
        ),
        actualBreakdown: calculateStockBreakdown(
          item.actualQuantity,
          item.product.pcsPerPack,
        ),
      })),
    }));
  }

  async findOne(id: string) {
    const audit = await this.prisma.inventoryAudit.findUnique({
      where: { id },
      include: {
        subWarehouse: {
          include: { warehouse: true },
        },
        items: {
          include: { product: true },
        },
      },
    });

    if (!audit) {
      throw new NotFoundException(`Inventarizatsiya hujjati topilmadi: ${id}`);
    }

    return {
      ...audit,
      items: audit.items.map((item) => ({
        ...item,
        systemBreakdown: calculateStockBreakdown(
          item.systemQuantity,
          item.product.pcsPerPack,
        ),
        actualBreakdown: calculateStockBreakdown(
          item.actualQuantity,
          item.product.pcsPerPack,
        ),
      })),
    };
  }

  async create(dto: CreateInventoryAuditDto) {
    const subWarehouse = await this.prisma.subWarehouse.findUnique({
      where: { id: dto.subWarehouseId },
    });
    if (!subWarehouse) {
      throw new NotFoundException(`Sub-ombor topilmadi: ${dto.subWarehouseId}`);
    }

    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Mavjud tizim qoldiqlarini olish
    const existingStocks = await this.prisma.stockItem.findMany({
      where: {
        subWarehouseId: dto.subWarehouseId,
        productId: { in: productIds },
      },
    });
    const stockMap = new Map(existingStocks.map((s) => [s.productId, s.quantityInUnits]));

    let totalDiffValue = 0;
    const auditItemsData = dto.items.map((itemDto) => {
      const product = productMap.get(itemDto.productId);
      if (!product) {
        throw new NotFoundException(`Mahsulot topilmadi: ${itemDto.productId}`);
      }

      const systemQty = stockMap.get(itemDto.productId) || 0;
      const actualPacks = itemDto.actualPacks || 0;
      const actualUnits = itemDto.actualUnits || 0;
      const actualQty = actualPacks * product.pcsPerPack + actualUnits;
      const diffQty = actualQty - systemQty;
      const diffValue = diffQty * product.costPrice;

      totalDiffValue += diffValue;

      return {
        productId: product.id,
        systemQuantity: systemQty,
        actualPacks,
        actualUnits,
        actualQuantity: actualQty,
        differenceQuantity: diffQty,
        unitCost: product.costPrice,
        differenceValue: diffValue,
      };
    });

    const auditNumber = `INV-${Date.now().toString().slice(-6)}`;

    return this.prisma.inventoryAudit.create({
      data: {
        auditNumber,
        subWarehouseId: dto.subWarehouseId,
        status: 'DRAFT',
        totalDifferenceValue: totalDiffValue,
        note: dto.note,
        items: {
          create: auditItemsData,
        },
      },
      include: {
        items: { include: { product: true } },
      },
    });
  }

  async complete(id: string) {
    const audit = await this.prisma.inventoryAudit.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
      },
    });

    if (!audit) {
      throw new NotFoundException(`Inventarizatsiya topilmadi: ${id}`);
    }

    if (audit.status === 'COMPLETED') {
      throw new BadRequestException('Bu inventarizatsiya allaqachon tasdiqlangan');
    }

    return this.prisma.$transaction(async (tx) => {
      // Har bir mahsulotning ombordagi haqiqiy qoldig'ini tizimga to'g'rilash
      for (const item of audit.items) {
        await tx.stockItem.upsert({
          where: {
            productId_subWarehouseId: {
              productId: item.productId,
              subWarehouseId: audit.subWarehouseId,
            },
          },
          update: {
            quantityInUnits: item.actualQuantity,
          },
          create: {
            productId: item.productId,
            subWarehouseId: audit.subWarehouseId,
            quantityInUnits: item.actualQuantity,
          },
        });
      }

      return tx.inventoryAudit.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
        include: {
          items: { include: { product: true } },
          subWarehouse: true,
        },
      });
    });
  }
}

