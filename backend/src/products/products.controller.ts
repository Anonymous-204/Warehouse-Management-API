// src/products/products.controller.ts
import { Controller, Get, Put,Req, Param,Query, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { WarehouseAccessGuard } from '../guard/warehouse-access.guard'; // 👈 Nhớ kiểm tra lại tên folder là 'guard' hay 'guards' nhé
import { UpdateInventoryDto } from './products.dto';
import { TransactionType } from '@prisma/client';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // 1. Lấy danh sách sản phẩm theo kho
  @Get('warehouse/:warehouseId')
  @UseGuards(WarehouseAccessGuard)
  async getProductsByWarehouse(@Param('warehouseId', ParseIntPipe) warehouseId: number) {
    return this.productsService.getProductsByWarehouse(warehouseId);
  }

  // 2. Cập nhật tồn kho (Gửi quantityChange trong Body)
  @Put('warehouse/:warehouseId/product/:productId/inventory')
  @UseGuards(WarehouseAccessGuard)
  async updateInventory(
    @Param('warehouseId', ParseIntPipe) warehouseId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: UpdateInventoryDto,
    @Req() req: any, // Giả sử req.user chứa thông tin User đăng nhập
  ) {
    // Lấy userId từ JWT Request hoặc từ Body (fallback tạm thời nếu chưa gắn Auth Guard)
    const userId = req.user?.id;
    const fullDto = { ...dto, warehouseId, productId, userId };
    return await this.productsService.updateInventory(fullDto);
  }
  @Get('history/me')
  // @UseGuards(WarehouseAccessGuard)
  async getMyStockHistory(
    @Req() req: any,
    @Query('type') type?: TransactionType,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    // userId được JwtAuthGuard lấy từ token JWT
    const userId = req.user.id;

    return await this.productsService.getUserStockHistory(userId, {
      type,
      page,
      limit,
    });
  }
}