import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { WarehousesService } from './warehouses.service.js';
import { CreateWarehouseDto, CreateSubWarehouseDto } from './dto/warehouse.dto.js';

@Controller()
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Get('warehouses')
  findAllWarehouses() {
    return this.warehousesService.findAllWarehouses();
  }

  @Post('warehouses')
  createWarehouse(@Body() dto: CreateWarehouseDto) {
    return this.warehousesService.createWarehouse(dto);
  }

  @Get('sub-warehouses')
  findAllSubWarehouses() {
    return this.warehousesService.findAllSubWarehouses();
  }

  @Post('sub-warehouses')
  createSubWarehouse(@Body() dto: CreateSubWarehouseDto) {
    return this.warehousesService.createSubWarehouse(dto);
  }

  @Get('sub-warehouses/:id/stock')
  getSubWarehouseStock(@Param('id') id: string) {
    return this.warehousesService.getSubWarehouseStock(id);
  }
}

