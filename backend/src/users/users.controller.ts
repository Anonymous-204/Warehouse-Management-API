// src/users/users.controller.ts
import { Controller, Get, Req,Query, NotFoundException, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express'; // 👈 Fix lỗi TS1272 (dùng Request từ express)
import type { AuthenticatedRequest } from '../guard/auth.middleware'; // 👈 Dùng 'import type' cho interface
import { UsersService } from './users.service';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@Req() req: Request) { // 👈 Đổi type thành Request để NestJS biên dịch Decorator ngon lành
    // Cast kiểu dữ liệu thủ công
    const authReq = req as AuthenticatedRequest; 
    const userId = authReq.user?.id;

    // 👈 Fix lỗi TS2345: Kiểm tra nếu không có email thì ném lỗi luôn
    if (!userId) {
      throw new UnauthorizedException('Không tìm thấy thông tin người dùng!');
    }

    const user = await this.usersService.findUserById(userId);
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại trong hệ thống!');
    }

    // Trả về thông tin ngoại trừ mật khẩu
    const { hashedPassword,createdAt, updatedAt, ...result } = user;
    return result;
  } 
  @Get('employees')
  async getemployees(
    @Req() req: AuthenticatedRequest,
  ){ 
    
    const {id, role, warehouseId} = req.user!
    return this.usersService.getEmployees(id, role, warehouseId)
  }
}