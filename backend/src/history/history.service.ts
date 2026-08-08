import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { TransactionType } from "@prisma/client";
@Injectable()
export class HistoryService{
    constructor(private prisma:PrismaService) {}
    async getMyIOHistory(userId: number,) 
    {
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
        };
      }
      async getMyAdjustHistory(userId: number,) {
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
          
        };
      }
      /**
     * Lấy lịch sử các giao dịch Điều chuyển (TRANSFER) của người dùng
     */
    async getMyTransferHistory(userId: number,) 
    {
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
      };
    }
}