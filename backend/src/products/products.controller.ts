import {
  Controller,
  Get,
  Put,
  Post,
  Req,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { WarehouseAccessGuard } from '../guard/warehouse-access.guard';
import { AdjustInventoryDto, IOInventoryDto, TransferInventoryDto } from './products.dto';
import { Role, TransactionType } from '@prisma/client';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/guard/roles.decorator';
import type { AuthenticatedRequest } from 'src/auth/auth.middleware';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // 1. Lấy danh sách sản phẩm theo kho
  @Get('warehouse/:warehouseId')
  @UseGuards(WarehouseAccessGuard)
  async getProductsByWarehouse(
    @Param('warehouseId', ParseIntPipe) warehouseId: number,
    @Req() req: AuthenticatedRequest
  ) {
    return this.productsService.getProductsByWarehouse(warehouseId, req.user!.role);
  }

  // 2. Xuất/Nhập kho
  @Put('inventory/io')
  @UseGuards(WarehouseAccessGuard)
  async IOInventory(
    @Body() dto: IOInventoryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.productsService.IOInventory(dto,req.user!.id);
  }

  // 3. Điều chỉnh tồn kho
  @Put('warehouse/:warehouseId/product/:productId/inventory/adjust')
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard, WarehouseAccessGuard)
  async adjustInventory(
    @Param('warehouseId', ParseIntPipe) warehouseId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: AdjustInventoryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.productsService.adjustInventory(
      warehouseId,
      productId,
      dto.quantityUpdate,
      req.user!.id,
      dto.note,
    );
  }

  // 4. Điều chuyển sản phẩm
  @Post('warehouse/:fromWarehouseId/transfer')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async transferInventory(
    @Param('fromWarehouseId', ParseIntPipe) fromWarehouseId: number,
    @Body() dto: TransferInventoryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.productsService.transferInventory(
      fromWarehouseId,
      dto.toWarehouseId,
      dto.productId,
      dto.quantity,
      req.user!.id,
      dto.note,
    );
  }

  // 5. Lấy lịch sử Nhập / Xuất kho của user (ĐÃ BỎ WarehouseAccessGuard)
  @Get('history/me/io')
  async getMyIOHistory(
    @Req() req: AuthenticatedRequest,
    @Query('type') type?: TransactionType,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.productsService.getMyIOHistory(req.user!.id, {
      type,
      page,
      limit,
    });
  }

  // 6. Lấy lịch sử Điều chỉnh (ADJUST) của user (ĐÃ BỎ WarehouseAccessGuard)
  @Get('history/me/adjust')
  @Roles('MANAGER', 'ADMIN')
  @UseGuards(RolesGuard)
  async getMyAdjustHistory(
    @Req() req: AuthenticatedRequest,
    @Query('type') type?: TransactionType,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.productsService.getMyAdjustHistory(req.user!.id, {
      type,
      page,
      limit,
    });
  }

  // 7. Lấy lịch sử Điều chuyển (TRANSFER) của user
  @Get('history/me/transfer')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async getMyTransferHistory(
    @Req() req: AuthenticatedRequest,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.productsService.getMyTransferHistory(req.user!.id, {
      page,
      limit,
    });
  }
}