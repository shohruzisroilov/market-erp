import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InventoryItemDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  actualPacks?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  actualUnits?: number;
}

export class CreateInventoryAuditDto {
  @IsString()
  @IsNotEmpty()
  subWarehouseId!: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InventoryItemDto)
  items!: InventoryItemDto[];
}

