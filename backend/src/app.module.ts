import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProductsModule } from './modules/products/products.module.js';
import { WarehousesModule } from './modules/warehouses/warehouses.module.js';
import { PurchasesModule } from './modules/purchases/purchases.module.js';
import { SalesModule } from './modules/sales/sales.module.js';
import { InventoryModule } from './modules/inventory/inventory.module.js';
import { CashboxModule } from './modules/cashbox/cashbox.module.js';
import { ReportsModule } from './modules/reports/reports.module.js';

@Module({
  imports: [
    PrismaModule,
    ProductsModule,
    WarehousesModule,
    PurchasesModule,
    SalesModule,
    InventoryModule,
    CashboxModule,
    ReportsModule,
  ],
})
export class AppModule {}
