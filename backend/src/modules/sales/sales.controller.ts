import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SalesService } from './sales.service.js';
import { CreateSaleDto } from './dto/sale.dto.js';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  findAll() {
    return this.salesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateSaleDto) {
    return this.salesService.create(dto);
  }

  @Post(':id/complete')
  complete(@Param('id') id: string) {
    return this.salesService.complete(id);
  }
}

