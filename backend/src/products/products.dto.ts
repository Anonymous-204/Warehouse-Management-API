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
export class IOInventoryDto {
  @IsInt()
  @IsNotEmpty()
  warehouseId!: number
  
  @IsInt()
  @IsNotEmpty()
  productId!: number

  @IsInt()
  @IsNotEmpty()
  quantity!: number; // Có thể nhận âm (-) hoặc dương (+) từ Frontend

  @IsString()
  @IsOptional()
  note?: string; 
}
// Điều chỉnh kho(MANAGER)
export class AdjustInventoryDto {

  @IsInt()
  @IsNotEmpty()
  @Min(0,{message:"Số lượng tồn kho không âm"})
  quantityUpdate!: number; // chỉ có thể dương (+) từ Frontend

  @IsString()
  @IsOptional()
  note?: string; 
}
export class TransferInventoryDto {
  @IsInt()
  @IsNotEmpty()
  toWarehouseId!: number;

  @IsInt()
  @IsNotEmpty()
  productId!: number;

  @IsInt()
  @Min(1, { message: 'Số lượng điều chuyển phải lớn hơn 0' })
  quantity!: number;

  @IsString()
  @IsOptional()
  note?: string;
}