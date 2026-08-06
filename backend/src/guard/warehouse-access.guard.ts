import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AuthenticatedRequest } from './auth.middleware';

@Injectable()
export class WarehouseAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    
    if (!user) {
      throw new ForbiddenException('Chưa xác thực thông tin người dùng!');
    }

    // ADMIN có quyền truy cập TẤT CẢ các kho
    if (user.role === 'ADMIN') {
      return true;
    }

    const paramWarehouseId = Number(request.params.warehouseId);

    // Bỏ qua kiểm tra nếu route không sử dụng param warehouseId
    if (isNaN(paramWarehouseId)) {
      return true;
    }

    // STAFF & MANAGER bắt buộc warehouseId truyền lên phải trùng với kho của mình
    if (user.role === 'STAFF' || user.role === 'MANAGER') {
      if (!user.warehouseId || user.warehouseId !== paramWarehouseId) {
        throw new ForbiddenException('Bạn không có quyền truy cập dữ liệu của kho này!');
      }
      return true;
    }
    throw new ForbiddenException('Role của bạn không hợp lệ!');
  }
}