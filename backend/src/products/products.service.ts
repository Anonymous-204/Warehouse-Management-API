import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Role, TransactionType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // Lấy danh sách sản phẩm theo warehouseId
  async getProductsByWarehouse(warehouseId: number, role:Role) {
    return this.prisma.inventory.findMany({
      where: {
        warehouseId: role==='ADMIN'?undefined:warehouseId
      },orderBy:{updatedAt: 'desc'},
      select: {
        quantity: true,
        costPrice: true,
        supplier: {
          select: {
            name: true,
          },
        },
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            description: true,
            price: true,
            category: { select: { name: true } },
            brand: { select: { name: true } },
          },
        },
      },
    });
  }

  /**
   * Nhập / Xuất sản phẩm + Ghi lịch sử giao dịch (StockTransaction)
   */
  
  async IOInventory(dto, userId:number){
    const {warehouseId, productId, quantity, note } = dto
    // Sử dụng Interactive Transaction để đảm bảo tính toàn vẹn dữ liệu (Atomic)
    return this.prisma.$transaction(async (tx) => {
      // 1. Kiểm tra sản phẩm có trong kho không
      const existingInventory = await tx.inventory.findFirst({
        where: { warehouseId, productId,  },
      });

      if (!existingInventory) {
        throw new NotFoundException('Không tìm thấy sản phẩm trong kho này!');
      }

      // 2. Chặn xuất quá số lượng hiện có (Tránh âm kho)
      if (existingInventory.quantity + quantity < 0) {
        throw new BadRequestException(
          `Số lượng tồn kho không đủ! (Hiện có: ${existingInventory.quantity}, Cần xuất: ${Math.abs(quantity)})`,
        );
      }

      // 3. Cập nhật số lượng tồn kho (Atomic increment)
      const updatedInventory = await tx.inventory.update({
        where: {
          id: existingInventory.id,
        },
        data: {
          quantity: {
            increment: quantity,
          },
        },
      });

      // 4. Xác định loại giao dịch (IN hoặc OUT)
      const transactionType: TransactionType = quantity > 0 ? 'IN' : 'OUT';

      // 5. Tạo bản ghi lịch sử vào bảng stock_transactions
      await tx.stockTransaction.create({
        data: { 
          userId: userId,
          productId: productId,
          warehouseId: warehouseId,
          quantity: Math.abs(quantity), // Lưu số lượng tuyệt đối trong bản ghi giao dịch
          type: transactionType,
          note: note || (transactionType === 'IN' ? 'Nhập kho' : 'Xuất kho'),
        },
      });

      return updatedInventory;
    });
  }
  async adjustInventory(warehouseId:number,productId:number, quantityUpdate:number, userId:number, note?:string) {
    return this.prisma.$transaction(async (tx)=>{
      const existingInventory = await tx.inventory.findFirst({
        where: {warehouseId, productId}
      })
      if(!existingInventory) {
        throw new NotFoundException("không thấy sản phẩm trong kho")
      }
      if(quantityUpdate<0){
        throw new BadRequestException("vui lòng không nhập số âm")
      }
      const stockvariance = quantityUpdate - existingInventory.quantity
      const adjustInventory = await tx.inventory.update({
        where: {
          id: existingInventory.id
        },
        data: {
          quantity: quantityUpdate
        }
      })
      await tx.stockTransaction.create({
        data: { 
          userId,
          productId,
          warehouseId,
          quantity: quantityUpdate, // Lưu số lượng tuyệt đối trong bản ghi giao dịch
          stockVariance: stockvariance,
          type: "ADJUST",
          note: note || "điều chỉnh tồn kho",
        },
      });
      return adjustInventory
    })
  }
  /**
   * Điều chuyển sản phẩm từ Kho Nguồn -> Kho Đích + Ghi lịch sử (TRANSFER)
   */
  async transferInventory(
  fromWarehouseId: number,
  toWarehouseId: number,
  productId: number,
  quantity: number,
  userId: number,
  note?: string,
) {
  // 1. Kiểm tra cơ bản
  if (fromWarehouseId === toWarehouseId) {
    throw new BadRequestException('Kho nguồn và kho đích không được trùng nhau!');
  }

  if (quantity <= 0) {
    throw new BadRequestException('Số lượng điều chuyển phải lớn hơn 0!');
  }

  return this.prisma.$transaction(async (tx) => {
    // 2. Kiểm tra kho nguồn và kho đích có tồn tại không
    const [fromWarehouse, toWarehouse] = await Promise.all([
      tx.warehouse.findUnique({ where: { id: fromWarehouseId } }),
      tx.warehouse.findUnique({ where: { id: toWarehouseId } }),
    ]);

    if (!fromWarehouse) throw new NotFoundException('Không tìm thấy kho nguồn!');
    if (!toWarehouse) throw new NotFoundException('Không tìm thấy kho đích!');

    // 3. Tìm sản phẩm trong kho nguồn
    const sourceInventory = await tx.inventory.findFirst({
      where: { warehouseId: fromWarehouseId, productId },
    });

    if (!sourceInventory) {
      throw new NotFoundException('Sản phẩm không có trong kho nguồn!');
    }

    if (sourceInventory.quantity < quantity) {
      throw new BadRequestException(
        `Số lượng tồn kho nguồn không đủ! (Hiện có: ${sourceInventory.quantity}, Cần chuyển: ${quantity})`,
      );
    }

    // 4. Trừ số lượng ở kho nguồn
    await tx.inventory.update({
      where: { id: sourceInventory.id },
      data: {
        quantity: { decrement: quantity },
      },
    });

    // 5. Kiểm tra kho đích đã có bản ghi tồn kho cho sản phẩm này chưa
    const targetInventory = await tx.inventory.findFirst({
      where: { warehouseId: toWarehouseId, productId },
    });

    if (targetInventory) {
      // Nếu đã có -> Cộng thêm số lượng
      await tx.inventory.update({
        where: { id: targetInventory.id },
        data: {
          quantity: { increment: quantity },
        },
      });
    } else {
      // Nếu chưa có -> Tạo mới bản ghi tồn kho ở kho đích
      await tx.inventory.create({
        data: {
          warehouseId: toWarehouseId,
          productId,
          supplierId: sourceInventory.supplierId,
          quantity: quantity,
          costPrice: sourceInventory.costPrice,
        },
      });
    }

    // 6. Tạo bản ghi giao dịch TRANSFER vào bảng stock_transactions
    const transaction = await tx.stockTransaction.create({
      data: {
        userId,
        productId,
        warehouseId: fromWarehouseId,
        toWarehouseId: toWarehouseId,
        quantity,
        type: 'TRANSFER',
        note: note || `Điều chuyển từ ${fromWarehouse.name} sang ${toWarehouse.name}`,
      },
    });

    // 🚀 Bổ sung tên 2 kho vào kết quả trả về
    return {
      ...transaction,
      fromWarehouseName: fromWarehouse.name,
      toWarehouseName: toWarehouse.name,
    };
  });
}
  async getMyIOHistory(
    userId: number,
    options?: {
      type?: TransactionType;
      page?: number;
      limit?: number;
    },
  ) {
    const page = options?.page && options.page > 0 ? Number(options.page) : 1;
    const limit = options?.limit && options.limit > 0 ? Number(options.limit) : 10;
    const skip = (page - 1) * limit;

    // Điều kiện lọc theo userId và type (nếu có)
    const whereCondition: any = { 
      userId,
      type:{ in:['IN','OUT' ]}
    };

    // Lấy danh sách giao dịch và tổng số bản ghi song song
    const [transactions, total] = await Promise.all([
      this.prisma.stockTransaction.findMany({
        where: whereCondition,
        orderBy: {
          createdAt: 'desc', // Mới nhất lên đầu
        },
        skip,
        take: limit,
        select: {
          id: true,
          quantity: true,
          type: true,
          note: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              sku: true,
              name: true,
            },
          },
          warehouse: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.stockTransaction.count({
        where: whereCondition,
      }),
    ]);

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async getMyAdjustHistory(
    userId: number,
    options?: {
      type?: TransactionType;
      page?: number;
      limit?: number;
    },
  ) {
    const page = options?.page && options.page > 0 ? Number(options.page) : 1;
    const limit = options?.limit && options.limit > 0 ? Number(options.limit) : 10;
    const skip = (page - 1) * limit;

    // Điều kiện lọc theo userId và type (nếu có)
    const whereCondition: any = { 
      userId,
      type: 'ADJUST', 
    };

    // Lấy danh sách giao dịch và tổng số bản ghi song song
    const [transactions, total] = await Promise.all([
      this.prisma.stockTransaction.findMany({
        where: whereCondition,
        orderBy: {
          createdAt: 'desc', // Mới nhất lên đầu
        },
        skip,
        take: limit,
        select: {
          id: true,
          quantity: true,
          stockVariance:true,
          type: true,
          note: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              sku: true,
              name: true
            },
          },
          warehouse: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.stockTransaction.count({
        where: whereCondition,
      }),
    ]);

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  /**
 * Lấy lịch sử các giao dịch Điều chuyển (TRANSFER) của người dùng
 */
async getMyTransferHistory(
  userId: number,
  options?: {
    page?: number;
    limit?: number;
  },
) {
  const page = options?.page && options.page > 0 ? Number(options.page) : 1;
  const limit = options?.limit && options.limit > 0 ? Number(options.limit) : 10;
  const skip = (page - 1) * limit;

  const whereCondition: any = {
    userId,
    type: 'TRANSFER',
  };

  const [transactions, total] = await Promise.all([
    this.prisma.stockTransaction.findMany({
      where: whereCondition,
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
      select: {
        id: true,
        quantity: true,
        type: true,
        note: true,
        createdAt: true,
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
          },
        },
        warehouse: {
          select: {
            id: true,
            name: true,
          },
        },
        toWarehouse: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    this.prisma.stockTransaction.count({
      where: whereCondition,
    }),
  ]);

  return {
    data: transactions,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
}