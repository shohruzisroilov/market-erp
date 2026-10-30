import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  pcsPerPack?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  costPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  sellPriceUnit?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  sellPricePack?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minStockAlert?: number;
}

