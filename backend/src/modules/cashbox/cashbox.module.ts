import { Module } from '@nestjs/common';
import { CashboxService } from './cashbox.service.js';
import { CashboxController } from './cashbox.controller.js';

@Module({
  controllers: [CashboxController],
  providers: [CashboxService],
  exports: [CashboxService],
})
export class CashboxModule {}

