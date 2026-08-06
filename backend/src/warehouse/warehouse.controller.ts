import {Controller,  Get, Req } from "@nestjs/common";
import { WarehouseService } from "./warehouse.service";
import type { AuthenticatedRequest } from "src/guard/auth.middleware";
@Controller('warehouses')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}
    @Get()
    async getAllWarehouses(@Req() req: AuthenticatedRequest) {
      const { warehouseId, role } = req.user;
      return this.warehouseService.getAllWarehouses(warehouseId, role);
    }
}