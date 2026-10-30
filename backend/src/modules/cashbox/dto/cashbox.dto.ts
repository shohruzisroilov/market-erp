import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export const CASH_TRANSACTION_TYPES = [
  'SALE_INCOME',
  'PURCHASE_PAYMENT',
  'EXPENSE_TRANSPORT',
  'EXPENSE_RENT',
  'EXPENSE_SALARY',
  'EXPENSE_UTILITIES',
  'EXPENSE_OTHER',
  'DEBT_GIVEN',
  'DEBT_COLLECTED',
  'DEBT_TAKEN',
  'DEBT_REPAID',
  'OTHER_INCOME',
] as const;

export type CashTransactionType = (typeof CASH_TRANSACTION_TYPES)[number];

export class CreateCashTransactionDto {
  @IsString()
  @IsNotEmpty()
  cashRegisterId!: string;

  @IsString()
  @IsIn(CASH_TRANSACTION_TYPES)
  type!: CashTransactionType;

  @IsNumber()
  @Min(1)
  amount!: number;

  @IsString()
  @IsOptional()
  partyName?: string;

  @IsString()
  @IsOptional()
  note?: string;
}

export class CreateCashRegisterDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @IsOptional()
  initialBalance?: number;
}

