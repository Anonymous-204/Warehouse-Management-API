import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { HistoryService } from "./history.service";
import type { AuthenticatedRequest } from "src/guard/auth.middleware";
import { Roles } from "src/guard/roles.decorator"
import { RolesGuard } from "src/guard/roles.guard";
@Controller('history')
export class HistoryController {
    constructor(private readonly historyService:HistoryService){}
  @Get('io')
  async getMyIOHistory(
    @Req() req: AuthenticatedRequest) {
    return await this.historyService.getMyIOHistory(req.user!.id);
  }

  @Get('adjust')
  @Roles('MANAGER', 'ADMIN')
  @UseGuards(RolesGuard)
  async getMyAdjustHistory(
    @Req() req: AuthenticatedRequest,
  ) 
  {
    return await this.historyService.getMyAdjustHistory(req.user!.id);
  }

  @Get('transfer')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async getMyTransferHistory(
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.historyService.getMyTransferHistory(req.user!.id);
  }
}