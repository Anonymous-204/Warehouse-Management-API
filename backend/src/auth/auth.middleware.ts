// src/auth/auth.middleware.ts
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

// Extend type Request để gán user sau khi giải mã
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: Role;
    name?: string;
    warehouseId?: number | null;
  };
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    // 1. Đọc accessToken từ Cookie (cần cài cookie-parser ở main.ts)
    const token = req.cookies?.['accessToken'];

    if (!token) {
      throw new UnauthorizedException('Không tìm thấy Access Token trong Cookie!');
    }

    try {
      // 2. Verify token bằng JWT Secret
      const secretKey = process.env.JWT_SECRET || 'your_default_jwt_secret';
      const decoded = jwt.verify(token, secretKey) as AuthenticatedRequest['user'];

      // 3. Gán thông tin user giải mã được vào req.user
      req.user = decoded;

      // 4. Cho phép request đi tiếp tới Controller
      next();
    } catch (error) {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn!');
    }
  }
}