// src/users/users.controller.ts
import { Controller, Get, Req,Query, NotFoundException, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express'; // 👈 Fix lỗi TS1272 (dùng Request từ express)
import type { AuthenticatedRequest } from '../auth/auth.middleware'; // 👈 Dùng 'import type' cho interface
import { UsersService } from './users.service';
import { getEmployeesDto } from './users.dto';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@Req() req: Request) { // 👈 Đổi type thành Request để NestJS biên dịch Decorator ngon lành
    // Cast kiểu dữ liệu thủ công
    const authReq = req as AuthenticatedRequest; 
    const email = authReq.user?.email;

    // 👈 Fix lỗi TS2345: Kiểm tra nếu không có email thì ném lỗi luôn
    if (!email) {
      throw new UnauthorizedException('Không tìm thấy thông tin người dùng!');
    }

    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại trong hệ thống!');
    }

    // Trả về thông tin ngoại trừ mật khẩu
    const { hashedPassword, ...result } = user;
    return result;
  } 
  @Get('employees')
  async getemployees(
    @Req() req: AuthenticatedRequest,
    @Query() data: getEmployeesDto
  ){
    
    const {id, role} = req.user!
    return this.usersService.getEmployees(data,id,role)
  }
}