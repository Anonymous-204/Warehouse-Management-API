import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser'; // 1. Import cookie-parser

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 2. Kích hoạt cookie-parser để bóc tách req.cookies
  app.use(cookieParser());

  // Thêm dòng này vào trước app.listen()
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Tự động loại bỏ các field không được định nghĩa trong DTO
    transform: true, // Tự động convert kiểu dữ liệu phù hợp với DTO
  }));
  app.enableCors({
    origin: 'http://localhost:5173', // Domain của Vite/React
    credentials: true,               // BẮT BUỘC có để nhận/gửi Cookie httpOnly
  });
  await app.listen(3000);
}
bootstrap();