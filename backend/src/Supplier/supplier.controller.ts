import {Controller, Get, Req} from '@nestjs/common';
import { SupplierService } from './supplier.service';
import type { AuthenticatedRequest } from 'src/guard/auth.middleware';

@Controller('suppliers')
export class SupplierController {
  constructor(private supplierService: SupplierService) {}

  @Get()
  async getAllSuppliers(@Req() req: AuthenticatedRequest) {
    return this.supplierService.getAllSuppliers();
  }
}
export default SupplierController;