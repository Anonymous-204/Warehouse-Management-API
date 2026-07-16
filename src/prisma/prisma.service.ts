import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // 🟢 BỎ HOÀN TOÀN CONSTRUCTOR CŨ ĐI
  // Vì Prisma 7 sẽ tự động đọc cấu hình từ file prisma.config.ts của bạn ở môi trường runtime.

  async onModuleInit() {
    // Kết nối trực tiếp xuống DB PostgreSQL dưới Docker
    await this.$connect();
  }
}