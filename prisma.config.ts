import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

// 🟢 ÉP NẠP FILE .ENV VÀO HỆ THỐNG NGAY LẬP TỨC
dotenv.config();

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});