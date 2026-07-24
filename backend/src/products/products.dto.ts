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
// xuất và nhập kho(STAFF)
export class UpdateInventoryDto {
  @IsNotEmpty()
  warehouseId!: number;

  @IsNotEmpty()
  productId!: number;

  @IsInt()
  @IsNotEmpty()
  quantityChange!: number; // Có thể nhận âm (-) hoặc dương (+) từ Frontend

  @IsString()
  @IsOptional()
  note?: string; 

  @IsInt()
  @IsNotEmpty()
  userId!: number; // Truyền userId người thực hiện
}
// Điều chỉnh kho(MANAGER)
export class adjustInventoryDto {
  @IsNotEmpty()
  warehouseId!: number;

  @IsNotEmpty()
  productId!: number;

  @IsInt()
  @IsNotEmpty()
  quantityUpdate!: number; // chỉ có thể dương (+) từ Frontend

  @IsString()
  @IsOptional()
  note?: string; 

  @IsInt()
  @IsNotEmpty()
  userId!: number; // Truyền userId người thực hiện
}
