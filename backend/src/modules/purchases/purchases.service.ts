import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreatePurchaseDto } from './dto/purchase.dto.js';
import { calculateStockBreakdown } from '../../common/utils/stock.util.js';

@Injectable()
export class PurchasesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const invoices = await this.prisma.purchaseInvoice.findMany({
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

    return invoices.map((inv) => ({
      ...inv,
      items: inv.items.map((item) => ({
        ...item,
        ...calculateStockBreakdown(item.totalUnits, item.product.pcsPerPack),
      })),
    }));
  }

  async findOne(id: string) {
    const invoice = await this.prisma.purchaseInvoice.findUnique({
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

    if (!invoice) {
      throw new NotFoundException(`Xarid hujjati topilmadi: ${id}`);
    }

    return {
      ...invoice,
      items: invoice.items.map((item) => ({
        ...item,
        ...calculateStockBreakdown(item.totalUnits, item.product.pcsPerPack),
      })),
    };
  }

  async create(dto: CreatePurchaseDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Hujjatda kamida bitta mahsulot bo\'lishi shart');
    }

    // Sub-ombor mavjudligini tekshirish
    const subWarehouse = await this.prisma.subWarehouse.findUnique({
      where: { id: dto.subWarehouseId },
    });
    if (!subWarehouse) {
      throw new NotFoundException(`Sub-ombor topilmadi: ${dto.subWarehouseId}`);
    }

    // Mahsulotlarni olish
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    let calculatedTotal = 0;
    const invoiceItemsData = dto.items.map((itemDto) => {
      const product = productMap.get(itemDto.productId);
      if (!product) {
        throw new NotFoundException(`Mahsulot topilmadi: ${itemDto.productId}`);
      }

      const packQty = itemDto.packQuantity || 0;
      const unitQty = itemDto.unitQuantity || 0;
      const totalUnits = packQty * product.pcsPerPack + unitQty;
      const totalCost = totalUnits * itemDto.unitCost;
      calculatedTotal += totalCost;

      return {
        productId: product.id,
        packQuantity: packQty,
        unitQuantity: unitQty,
        totalUnits,
        unitCost: itemDto.unitCost,
        totalCost,
      };
    });

    const paidAmount = Math.min(calculatedTotal, dto.paidAmount || 0);
    const debtAmount = calculatedTotal - paidAmount;
    const invoiceNumber = `XARID-${Date.now().toString().slice(-6)}`;

    return this.prisma.purchaseInvoice.create({
      data: {
        invoiceNumber,
        supplierName: dto.supplierName,
        subWarehouseId: dto.subWarehouseId,
        status: 'DRAFT',
        totalAmount: calculatedTotal,
        paidAmount,
        debtAmount,
        note: dto.note,
        items: {
          create: invoiceItemsData,
        },
      },
      include: {
        items: { include: { product: true } },
      },
    });
  }

  async complete(id: string) {
    const invoice = await this.prisma.purchaseInvoice.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        subWarehouse: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Xarid hujjati topilmadi: ${id}`);
    }

    if (invoice.status === 'COMPLETED') {
      throw new BadRequestException('Bu xarid hujjati allaqachon bajarilgan');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Ombordagi qoldiqlarni oshirish
      for (const item of invoice.items) {
        const existingStock = await tx.stockItem.findUnique({
          where: {
            productId_subWarehouseId: {
              productId: item.productId,
              subWarehouseId: invoice.subWarehouseId,
            },
          },
        });

        if (existingStock) {
          await tx.stockItem.update({
            where: { id: existingStock.id },
            data: {
              quantityInUnits: existingStock.quantityInUnits + item.totalUnits,
            },
          });
        } else {
          await tx.stockItem.create({
            data: {
              productId: item.productId,
              subWarehouseId: invoice.subWarehouseId,
              quantityInUnits: item.totalUnits,
            },
          });
        }

        // Oxirgi tannarxni yangilash
        await tx.product.update({
          where: { id: item.productId },
          data: { costPrice: item.unitCost },
        });
      }

      // 2. Agar to'lov qilingan bo'lsa, kassadan chiqim qilish
      if (invoice.paidAmount > 0) {
        const defaultCash = await tx.cashRegister.findFirst({
          where: { isDefault: true },
        });

        if (defaultCash) {
          await tx.cashRegister.update({
            where: { id: defaultCash.id },
            data: { balance: defaultCash.balance - invoice.paidAmount },
          });

          await tx.cashTransaction.create({
            data: {
              cashRegisterId: defaultCash.id,
              type: 'PURCHASE_PAYMENT',
              direction: 'OUT',
              amount: invoice.paidAmount,
              category: 'TRADE',
              partyName: invoice.supplierName,
              relatedId: invoice.id,
              note: `Xarid uchun to'lov (${invoice.invoiceNumber})`,
            },
          });
        }
      }

      // 3. Agar yetkazib beruvchiga qarz qolgan bo'lsa, kontragent balansiga yozish
      if (invoice.debtAmount > 0) {
        const supplier = await tx.counterparty.findFirst({
          where: { name: invoice.supplierName },
        });
        if (supplier) {
          // Manfiy balans: biz ulardan qarzdormiz
          await tx.counterparty.update({
            where: { id: supplier.id },
            data: { balance: supplier.balance - invoice.debtAmount },
          });
        } else {
          await tx.counterparty.create({
            data: {
              name: invoice.supplierName,
              type: 'SUPPLIER',
              balance: -invoice.debtAmount,
            },
          });
        }
      }

      // 4. Hujjat holatini COMPLETED ga o'tkazish
      return tx.purchaseInvoice.update({
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

