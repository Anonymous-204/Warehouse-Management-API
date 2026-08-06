import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
@Injectable()
export class SupplierService {
  constructor(private prisma: PrismaService) {}
  async getAllSuppliers() {
    return this.prisma.supplier.findMany({
      select: {
          id:true,
          name:true,
          image:true,
          description:true
      },
    });
  }
}