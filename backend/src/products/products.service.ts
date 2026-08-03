import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Role, TransactionType } from '@prisma/client';
import { AdjustInventoryDto, IOInventoryDto } from './products.dto';
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
  
  async IOInventory(data:IOInventoryDto, userId:number){
    const {warehouseId, productId, quantity, note } = data
    return this.prisma.$transaction(async (tx) => {
      // 1. Kiểm tra sản phẩm có trong kho không
      const existingInventory = await tx.inventory.findUnique({
        where:{warehouseId_productId:{warehouseId, productId}}
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
  async adjustInventory( data:AdjustInventoryDto,userId:number ) {
    const {warehouseId,productId, quantity, note}=data
    return this.prisma.$transaction(async (tx)=>{
      const existingInventory = await tx.inventory.findFirst({
        where: {warehouseId, productId}
      })
      if(!existingInventory) {
        throw new NotFoundException("không thấy sản phẩm trong kho")
      }
      if(quantity<0){
        throw new BadRequestException("vui lòng không nhập số âm")
      }
      const stockvariance = quantity - existingInventory.quantity
      const updatedInventory = await tx.inventory.update({
        where: {
          id: existingInventory.id
        },
        data: {
          quantity
        }
      })
      await tx.stockTransaction.create({
        data: { 
          userId,
          productId,
          warehouseId,
          quantity: quantity, // Lưu số lượng tuyệt đối trong bản ghi giao dịch
          stockVariance: stockvariance,
          type: "ADJUST",
          note: note || "điều chỉnh tồn kho",
        },
      });
      return updatedInventory
    })
  }
  /**
   * Điều chuyển sản phẩm từ Kho Nguồn -> Kho Đích + Ghi lịch sử (TRANSFER)
   */
  async transferInventory(data,userId: number){
  const {fromWarehouseId,toWarehouseId, productId, quantity, note}=data
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
  async getDashboardStats() {
  // 1. Mốc thời gian bắt đầu và kết thúc ngày hôm nay
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // 2. Chạy Promise.all song song các query
  const [
    totalProducts,
    totalInventory,
    activeInventoryGrouped,
    lowStockGrouped,
    totalWarehouses,
    totalEmployees,
    todayTransactions,
  ] = await Promise.all([
    // 1. Tổng số sản phẩm
    this.prisma.product.count(),

    // 2. Tổng số lượng tồn kho
    this.prisma.inventory.aggregate({
      _sum: { quantity: true },
    }),

    // 3. Lấy danh sách productId có tồn kho > 0 (Dùng tính outOfStock)
    this.prisma.inventory.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      having: {
        quantity: { _sum: { gt: 0 } },
      },
    }),

    // 4. Sản phẩm có tổng tồn kho > 0 VÀ < 10 (Sắp hết hàng)
    this.prisma.inventory.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      having: {
        quantity: {
          _sum: {
            gt: 0,
            lt: 10,
          },
        },
      },
    }),

    // 5. Tổng số kho
    this.prisma.warehouse.count(),

    // 6. Tổng số nhân viên
    this.prisma.user.count(),

    // 7. Lấy TẤT CẢ giao dịch hôm nay + INCLUDE thông tin Product (chú ý dùng include)
    this.prisma.stockTransaction.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        product: {
          select: {
            price: true, // Lấy duy nhất cột price từ bảng Product
          },
        },
      },
    }),
  ]);

  // --- XỬ LÝ DỮ LIỆU ---

  let todayImport = 0;
  let todayExport = 0;
  let todayAdjust = 0;
  let todayTransfer = 0;
  let todayImportValue = 0;
  let todayExportValue = 0;

  todayTransactions.forEach((tx) => {
    // Ép kiểu Decimal từ Prisma sang Number để nhân toán học
    const unitPrice = tx.product?.price ? Number(tx.product.price) : 0;
    const itemValue = tx.quantity * unitPrice;

    if (tx.type === 'IN') {
      todayImport += tx.quantity;
      todayImportValue += itemValue;
    } else if (tx.type === 'OUT') {
      todayExport += tx.quantity;
      todayExportValue += itemValue;
    } else if (tx.type === 'ADJUST') {
      todayAdjust += tx.quantity;
    } else if (tx.type === 'TRANSFER') {
      todayTransfer += tx.quantity;
    }
  });

  // Số lượng sản phẩm HẾT HÀNG = Tổng SP - Số SP đang có tồn kho > 0
  const activeProductCount = activeInventoryGrouped.length;
  const outOfStockCount = Math.max(0, totalProducts - activeProductCount);

  return {
    totalProducts,
    totalInventory: totalInventory._sum.quantity || 0,
    lowStock: lowStockGrouped.length,
    outOfStock: outOfStockCount,
    totalWarehouses,
    totalEmployees,
    todayImport,
    todayExport,
    todayAdjust,
    todayTransfer,
    todayImportValue,
    todayExportValue,
  };
}
}