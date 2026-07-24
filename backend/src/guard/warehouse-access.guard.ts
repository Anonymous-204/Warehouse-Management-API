// src/guards/warehouse-access.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AuthenticatedRequest } from '../auth/auth.middleware';

@Injectable()
export class WarehouseAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    const paramWarehouseId = Number(request.params.warehouseId);

    if (!user) {
      throw new ForbiddenException('Chưa xác thực thông tin người dùng!');
    }

    // 1. ADMIN có quyền truy cập TẤT CẢ các kho
    if (user.role === 'ADMIN') {
      return true;
    }

    // 2. STAFF & MANAGER bắt buộc warehouseId truyền lên phải trùng với kho của mình
    if (user.role === 'STAFF' || user.role === 'MANAGER') {
      if (!user.warehouseId || user.warehouseId !== paramWarehouseId) {
        throw new ForbiddenException('Bạn không có quyền truy cập dữ liệu của kho này!');
      }
      return true;
    }

    throw new ForbiddenException('Role của bạn không hợp lệ!');
  }
}