import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  CreateCashRegisterDto,
  CreateCashTransactionDto,
} from './dto/cashbox.dto.js';

@Injectable()
export class CashboxService {
  constructor(private readonly prisma: PrismaService) {}

  async getRegisters() {
    const registers = await this.prisma.cashRegister.findMany({
      orderBy: { isDefault: 'desc' },
    });
    const totalBalance = registers.reduce((sum, r) => sum + r.balance, 0);

    return {
      registers,
      totalBalance,
    };
  }

  async createRegister(dto: CreateCashRegisterDto) {
    return this.prisma.cashRegister.create({
      data: {
        name: dto.name,
        balance: dto.initialBalance ?? 0,
      },
    });
  }

  async getTransactions() {
    return this.prisma.cashTransaction.findMany({
      include: {
        cashRegister: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async createTransaction(dto: CreateCashTransactionDto) {
    const register = await this.prisma.cashRegister.findUnique({
      where: { id: dto.cashRegisterId },
    });
    if (!register) {
      throw new NotFoundException(`Kassa topilmadi: ${dto.cashRegisterId}`);
    }

    const inTypes = [
      'SALE_INCOME',
      'DEBT_COLLECTED',
      'DEBT_TAKEN',
      'OTHER_INCOME',
    ];
    const direction = inTypes.includes(dto.type) ? 'IN' : 'OUT';

    let category = 'OPERATING';
    if (['DEBT_GIVEN', 'DEBT_COLLECTED', 'DEBT_TAKEN', 'DEBT_REPAID'].includes(dto.type)) {
      category = 'FINANCING';
    } else if (['SALE_INCOME', 'PURCHASE_PAYMENT'].includes(dto.type)) {
      category = 'TRADE';
    }

    if (direction === 'OUT' && register.balance < dto.amount) {
      throw new BadRequestException(
        `Kassada mablag' yetarli emas. Mavjud: ${register.balance.toLocaleString()} so'm, chiqim: ${dto.amount.toLocaleString()} so'm`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Kassa balansini yangilash
      const newBalance =
        direction === 'IN'
          ? register.balance + dto.amount
          : register.balance - dto.amount;

      await tx.cashRegister.update({
        where: { id: register.id },
        data: { balance: newBalance },
      });

      // 2. Qarz harakatlarini kontragent balansida aks ettirish
      if (dto.partyName && category === 'FINANCING') {
        const party = await tx.counterparty.findFirst({
          where: { name: dto.partyName },
        });

        let delta = 0;
        if (dto.type === 'DEBT_GIVEN') {
          delta = dto.amount; // U bizga qarzdor bo'ldi (+)
        } else if (dto.type === 'DEBT_COLLECTED') {
          delta = -dto.amount; // Bizga qarzini qaytardi (-)
        } else if (dto.type === 'DEBT_TAKEN') {
          delta = -dto.amount; // Biz undan qarz oldik, biz qarzdormiz (-)
        } else if (dto.type === 'DEBT_REPAID') {
          delta = dto.amount; // Biz olingan qarzni to'ladik (+)
        }

        if (party) {
          await tx.counterparty.update({
            where: { id: party.id },
            data: { balance: party.balance + delta },
          });
        } else {
          await tx.counterparty.create({
            data: {
              name: dto.partyName,
              type: 'OTHER',
              balance: delta,
            },
          });
        }
      }

      // 3. Tranzaksiyani yozish
      return tx.cashTransaction.create({
        data: {
          cashRegisterId: register.id,
          type: dto.type,
          direction,
          amount: dto.amount,
          category,
          partyName: dto.partyName || null,
          note: dto.note || null,
        },
        include: {
          cashRegister: true,
        },
      });
    });
  }

  async getCounterparties() {
    const counterparties = await this.prisma.counterparty.findMany({
      orderBy: { balance: 'desc' },
    });

    const totalReceivable = counterparties
      .filter((c) => c.balance > 0)
      .reduce((sum, c) => sum + c.balance, 0);

    const totalPayable = counterparties
      .filter((c) => c.balance < 0)
      .reduce((sum, c) => sum + Math.abs(c.balance), 0);

    return {
      counterparties,
      totalReceivable, // Bizga berilishi kerak bo'lgan qarzlar
      totalPayable,    // Biz to'lashimiz kerak bo'lgan qarzlar
    };
  }
}

