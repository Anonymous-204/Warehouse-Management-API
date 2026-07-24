import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateInventoryDto } from './products.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // Lấy danh sách sản phẩm theo warehouseId
  async getProductsByWarehouse(warehouseId: number) {
    return await this.prisma.inventory.findMany({
      where: {
        warehouseId: warehouseId,
      },
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
  async updateInventory(dto: UpdateInventoryDto){
    const { warehouseId, productId, quantityChange, userId, note } = dto;
    // Sử dụng Interactive Transaction để đảm bảo tính toàn vẹn dữ liệu (Atomic)
    return await this.prisma.$transaction(async (tx) => {
      // 1. Kiểm tra sản phẩm có trong kho không
      const existingInventory = await tx.inventory.findFirst({
        where: { warehouseId, productId },
      });

      if (!existingInventory) {
        throw new NotFoundException('Không tìm thấy sản phẩm trong kho này!');
      }

      // 2. Chặn xuất quá số lượng hiện có (Tránh âm kho)
      if (quantityChange < 0 && existingInventory.quantity + quantityChange < 0) {
        throw new BadRequestException(
          `Số lượng tồn kho không đủ! (Hiện có: ${existingInventory.quantity}, Cần xuất: ${Math.abs(quantityChange)})`,
        );
      }

      // 3. Cập nhật số lượng tồn kho (Atomic increment)
      const updatedInventory = await tx.inventory.update({
        where: {
          id: existingInventory.id,
        },
        data: {
          quantity: {
            increment: quantityChange,
          },
        },
      });

      // 4. Xác định loại giao dịch (IN hoặc OUT)
      const transactionType: TransactionType = quantityChange > 0 ? 'IN' : 'OUT';

      // 5. Tạo bản ghi lịch sử vào bảng stock_transactions
      await tx.stockTransaction.create({
        data: {
          userId: userId,
          productId: productId,
          warehouseId: warehouseId,
          quantity: Math.abs(quantityChange), // Lưu số lượng tuyệt đối trong bản ghi giao dịch
          type: transactionType,
          note: note || (transactionType === 'IN' ? 'Nhập kho' : 'Xuất kho'),
        },
      });

      return updatedInventory;
    });
  }
  async getUserStockHistory(
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
    const whereCondition: any = { userId };
    if (options?.type) {
      whereCondition.type = options.type;
    }

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
              price: true,
            },
          },
          warehouse: {
            select: {
              id: true,
              name: true,
              address: true,
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