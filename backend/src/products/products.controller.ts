import {
  Controller,
  Get,
  Put,
  Req,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UseGuards,
  Post,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { WarehouseAccessGuard } from '../guard/warehouse-access.guard';
import { CreateProductDto } from './products.dto';
import { Role, TransactionType } from '@prisma/client';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/guard/roles.decorator';
import type { AuthenticatedRequest } from 'src/guard/auth.middleware';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // 1. Lấy danh sách tất cả sản phẩm 
  @Get()
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  async getAllProduct() {
    return this.productsService.getAllProduct();
  }
  //9. lấy thông tin trước khi tạo sản phẩm
  @Roles('ADMIN','MANAGER')
  @UseGuards(RolesGuard)
  @Get('getbrandandcategory')
  async getBrandAndCategory(){
    return await this.productsService.getBrandAndCategory();
  }
  //10. Tạo sản phẩm
  @Roles('ADMIN','MANAGER')
  @UseGuards(RolesGuard)
  @Post('createProduct')
  async createProduct(@Body() dataProduct:CreateProductDto ){
    return this.productsService.createProduct(dataProduct);
  }
}