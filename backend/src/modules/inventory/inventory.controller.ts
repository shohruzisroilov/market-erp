import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { InventoryService } from './inventory.service.js';
import { CreateInventoryAuditDto } from './dto/inventory.dto.js';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateInventoryAuditDto) {
    return this.inventoryService.create(dto);
  }

  @Post(':id/complete')
  complete(@Param('id') id: string) {
    return this.inventoryService.complete(id);
  }
}

