// src/auth/auth.middleware.ts
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    role: Role;
    name: string;
    warehouseId?: number | null;
  };
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    // 1. Lấy chuỗi từ Header Authorization
    const authHeader = req.headers.authorization;

    // 2. Kiểm tra xem Header có tồn tại và đúng định dạng bắt đầu bằng 'Bearer ' không
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Yêu cầu phải có Access Token dạng Bearer!');
    }

    // 3. Tách chuỗi "Bearer <token>" để lấy phần <token> phía sau
    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Token không hợp lệ!');
    }

    try {
      // 4. Verify token bằng JWT Secret
      const secretKey = process.env.JWT_SECRET || 'your_default_jwt_secret';
      const decoded = jwt.verify(token, secretKey) as AuthenticatedRequest['user'];

      // 5. Gán thông tin user giải mã được vào req.user
      req.user = decoded;

      // 6. Cho phép đi tiếp sang Controller
      next();
    } catch (error) {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn!');
    }
  }
}