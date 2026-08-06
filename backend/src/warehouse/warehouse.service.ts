import { Injectable } from "@nestjs/common";
import { Role } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class WarehouseService {
  constructor(private prisma: PrismaService) {}

  // Implement your service methods here
  async getAllWarehouses(warehouseId?: number, role?:Role) {
    const warehouses = this.prisma.warehouse.findMany({
      where: {
        id: role==='ADMIN' ? undefined : warehouseId, 
      },
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
      },
    })
    return warehouses;
  }
}