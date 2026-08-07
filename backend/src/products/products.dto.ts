import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsNumber, 
  IsPositive, 
  Min, 
  IsInt
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  image?: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  categoryId!: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  brandId!: number;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;
}
