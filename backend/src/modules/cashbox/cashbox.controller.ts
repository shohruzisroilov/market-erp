import { Controller, Get, Post, Body } from '@nestjs/common';
import { CashboxService } from './cashbox.service.js';
import {
  CreateCashRegisterDto,
  CreateCashTransactionDto,
} from './dto/cashbox.dto.js';

@Controller('cashbox')
export class CashboxController {
  constructor(private readonly cashboxService: CashboxService) {}

  @Get('registers')
  getRegisters() {
    return this.cashboxService.getRegisters();
  }

  @Post('registers')
  createRegister(@Body() dto: CreateCashRegisterDto) {
    return this.cashboxService.createRegister(dto);
  }

  @Get('transactions')
  getTransactions() {
    return this.cashboxService.getTransactions();
  }

  @Post('transactions')
  createTransaction(@Body() dto: CreateCashTransactionDto) {
    return this.cashboxService.createTransaction(dto);
  }

  @Get('counterparties')
  getCounterparties() {
    return this.cashboxService.getCounterparties();
  }
}

