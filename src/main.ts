import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// main.ts
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Thêm dòng này vào trước app.listen()
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Tự động loại bỏ các field không được định nghĩa trong DTO
    transform: true, // Tự động convert kiểu dữ liệu phù hợp với DTO
  }));
  
  await app.listen(3000);
}
bootstrap();