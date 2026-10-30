import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsNumber()
  @Min(1)
  pcsPerPack!: number;

  @IsNumber()
  @Min(0)
  costPrice!: number;

  @IsNumber()
  @Min(0)
  sellPriceUnit!: number;

  @IsNumber()
  @Min(0)
  sellPricePack!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minStockAlert?: number;
}

