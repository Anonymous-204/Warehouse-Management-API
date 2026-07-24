// src/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedRequest } from '../auth/auth.middleware';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Lấy danh sách Roles được phép từ Decorator @Roles(...)
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    
    // Nếu API không yêu cầu Role cụ thể -> Cho qua
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Chưa xác thực thông tin người dùng!');
    }

    // Kiểm tra xem Role của user có nằm trong danh sách cho phép không
    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này!');
    }

    return true;
  }
}