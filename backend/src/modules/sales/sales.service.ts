import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateSaleDto } from './dto/sale.dto.js';
import { calculateStockBreakdown } from '../../common/utils/stock.util.js';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const invoices = await this.prisma.saleInvoice.findMany({
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
    const invoice = await this.prisma.saleInvoice.findUnique({
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
      throw new NotFoundException(`Savdo hujjati topilmadi: ${id}`);
    }

    return {
      ...invoice,
      items: invoice.items.map((item) => ({
        ...item,
        ...calculateStockBreakdown(item.totalUnits, item.product.pcsPerPack),
      })),
    };
  }

  async create(dto: CreateSaleDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Hujjatda kamida bitta mahsulot bo\'lishi shart');
    }

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

    let calculatedTotal = 0;
    let calculatedCostTotal = 0;

    const invoiceItemsData = dto.items.map((itemDto) => {
      const product = productMap.get(itemDto.productId);
      if (!product) {
        throw new NotFoundException(`Mahsulot topilmadi: ${itemDto.productId}`);
      }

      const packQty = itemDto.packQuantity || 0;
      const unitQty = itemDto.unitQuantity || 0;
      const totalUnits = packQty * product.pcsPerPack + unitQty;
      const totalAmount = totalUnits * itemDto.unitPrice;
      const totalCostAtSale = totalUnits * product.costPrice;

      calculatedTotal += totalAmount;
      calculatedCostTotal += totalCostAtSale;

      return {
        productId: product.id,
        packQuantity: packQty,
        unitQuantity: unitQty,
        totalUnits,
        unitPrice: itemDto.unitPrice,
        totalAmount,
        unitCostAtSale: product.costPrice,
        totalCostAtSale,
      };
    });

    const paidAmount = dto.paidAmount !== undefined ? dto.paidAmount : calculatedTotal;
    const debtAmount = Math.max(0, calculatedTotal - paidAmount);
    const grossProfit = calculatedTotal - calculatedCostTotal;
    const invoiceNumber = `SAVDO-${Date.now().toString().slice(-6)}`;

    return this.prisma.saleInvoice.create({
      data: {
        invoiceNumber,
        customerName: dto.customerName || 'Chakana xaridor',
        subWarehouseId: dto.subWarehouseId,
        status: 'DRAFT',
        totalAmount: calculatedTotal,
        paidAmount,
        debtAmount,
        paymentMethod: dto.paymentMethod || (debtAmount > 0 ? 'DEBT' : 'CASH'),
        totalCostAmount: calculatedCostTotal,
        grossProfit,
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
    const invoice = await this.prisma.saleInvoice.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        subWarehouse: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Savdo hujjati topilmadi: ${id}`);
    }

    if (invoice.status === 'COMPLETED') {
      throw new BadRequestException('Bu savdo hujjati allaqachon bajarilgan');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Ombordagi qoldiq yetarliligini tekshirish va kamaytirish
      for (const item of invoice.items) {
        const stock = await tx.stockItem.findUnique({
          where: {
            productId_subWarehouseId: {
              productId: item.productId,
              subWarehouseId: invoice.subWarehouseId,
            },
          },
        });

        const currentQty = stock ? stock.quantityInUnits : 0;
        if (currentQty < item.totalUnits) {
          throw new BadRequestException(
            `"${item.product.name}" mahsuloti uchun omborda yetarli qoldiq yo'q. Mavjud: ${currentQty} dona, so'ralgan: ${item.totalUnits} dona.`,
          );
        }

        await tx.stockItem.update({
          where: { id: stock!.id },
          data: {
            quantityInUnits: currentQty - item.totalUnits,
          },
        });
      }

      // 2. Agar to'lov bo'lsa, kassaga pul kirim qilish
      if (invoice.paidAmount > 0) {
        const isCard = invoice.paymentMethod === 'CARD';
        let cashReg = await tx.cashRegister.findFirst({
          where: isCard ? { name: { contains: 'Terminal' } } : { isDefault: true },
        });

        if (!cashReg) {
          cashReg = await tx.cashRegister.findFirst();
        }

        if (cashReg) {
          await tx.cashRegister.update({
            where: { id: cashReg.id },
            data: { balance: cashReg.balance + invoice.paidAmount },
          });

          await tx.cashTransaction.create({
            data: {
              cashRegisterId: cashReg.id,
              type: 'SALE_INCOME',
              direction: 'IN',
              amount: invoice.paidAmount,
              category: 'TRADE',
              partyName: invoice.customerName,
              relatedId: invoice.id,
              note: `Savdo tushumi (${invoice.invoiceNumber})`,
            },
          });
        }
      }

      // 3. Agar nasiya/qarz bo'lsa, mijoz balansiga yozish
      if (invoice.debtAmount > 0) {
        const customer = await tx.counterparty.findFirst({
          where: { name: invoice.customerName },
        });

        if (customer) {
          // Musbat balans: mijoz bizdan qarzdor
          await tx.counterparty.update({
            where: { id: customer.id },
            data: { balance: customer.balance + invoice.debtAmount },
          });
        } else {
          await tx.counterparty.create({
            data: {
              name: invoice.customerName,
              type: 'CUSTOMER',
              balance: invoice.debtAmount,
            },
          });
        }
      }

      // 4. Hujjat holatini COMPLETED qilish
      return tx.saleInvoice.update({
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

