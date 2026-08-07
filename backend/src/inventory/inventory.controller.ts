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
import { InventoryService } from './inventory.service';
import { WarehouseAccessGuard } from '../guard/warehouse-access.guard';
import { AdjustInventoryDto, IOInventoryDto, TransferInventoryDto, CreateProductDto } from './inventory.dto';
import { Role, TransactionType } from '@prisma/client';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/guard/roles.decorator';
import type { AuthenticatedRequest } from 'src/guard/auth.middleware';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly productsService: InventoryService) {}

  // 1. Lấy danh sách sản phẩm theo kho
  @Get('warehouse/:warehouseId')//fix
  @UseGuards(WarehouseAccessGuard)
  async getProductsByWarehouse(
    @Param('warehouseId', ParseIntPipe) warehouseId: number,
    @Req() req: AuthenticatedRequest
  ) {
    return this.productsService.getProductsByWarehouse(warehouseId, req.user!.role);
  }

  // 2. Xuất/Nhập kho
//   @Put('io')
//   @UseGuards(WarehouseAccessGuard)
//   async IOInventory(
//     @Body() data: IOInventoryDto,
//     @Req() req: AuthenticatedRequest,
//   ) {return this.productsService.IOInventory(data,req.user!.id);}

//   // 3. Điều chỉnh tồn kho
//   @Put('adjust')
//   @Roles('ADMIN', 'MANAGER')
//   @UseGuards(RolesGuard, WarehouseAccessGuard)
//   async adjustInventory(
//     @Body() data: AdjustInventoryDto,
//     @Req() req: AuthenticatedRequest,
//   ) {return this.productsService.adjustInventory(data,req.user!.id,);}

//   // 4. Điều chuyển sản phẩm
//   @Put('transfer')
//   @Roles('ADMIN')
//   @UseGuards(RolesGuard)
//   async transferInventory(
//     @Body() dto: TransferInventoryDto,
//     @Req() req: AuthenticatedRequest,
//   ) {return this.productsService.transferInventory(dto,req.user!.id);}

//   // 5. Lấy lịch sử Nhập / Xuất kho của user (ĐÃ BỎ WarehouseAccessGuard)
//   @Get('history/me/io')
//   async getMyIOHistory(
//     @Req() req: AuthenticatedRequest,
//     @Query('type') type?: TransactionType,
//     @Query('page') page?: number,
//     @Query('limit') limit?: number,
//   ) {
//     return await this.productsService.getMyIOHistory(req.user!.id, {
//       type,
//       page,
//       limit,
//     });
//   }

//   // 6. Lấy lịch sử Điều chỉnh (ADJUST) của user (ĐÃ BỎ WarehouseAccessGuard)
//   @Get('history/me/adjust')
//   @Roles('MANAGER', 'ADMIN')
//   @UseGuards(RolesGuard)
//   async getMyAdjustHistory(
//     @Req() req: AuthenticatedRequest,
//     @Query('type') type?: TransactionType,
//     @Query('page') page?: number,
//     @Query('limit') limit?: number,
//   ) {
//     return await this.productsService.getMyAdjustHistory(req.user!.id, {
//       type,
//       page,
//       limit,
//     });
//   }

//   // 7. Lấy lịch sử Điều chuyển (TRANSFER) của user
//   @Get('history/me/transfer')
//   @Roles('ADMIN')
//   @UseGuards(RolesGuard)
//   async getMyTransferHistory(
//     @Req() req: AuthenticatedRequest,
//     @Query('page') page?: number,
//     @Query('limit') limit?: number,
//   ) {
//     return await this.productsService.getMyTransferHistory(req.user!.id, {
//       page,
//       limit,
//     });
//   }

  // 8. Lấy thống kê Dashboard
  @Get('dashboard/stats')
  async getDashboardStats() {
    return await this.productsService.getDashboardStats();
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