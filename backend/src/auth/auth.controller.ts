// auth.controller.ts
import { Controller, Post, Body, Res, HttpCode, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.registerUser(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response, // passthrough giúp giữ cơ chế return JSON của NestJS
  ) {
    const { accessToken, refreshToken, user } = await this.authService.loginUser(loginDto);

    // 1. Set Access Token Cookie (Sống 1 giờ)
    res.cookie('accessToken', accessToken, {
      httpOnly: true, // Bảo mật chống XSS
      secure: process.env.NODE_ENV === 'production', // Dùng HTTPS khi production
      sameSite: 'lax', // Hoặc 'strict' tùy theo cấu hình Frontend/Backend khác origin hay không
      maxAge: 60 * 60 * 1000, // 1 giờ (milliseconds)
    });

    // 2. Set Refresh Token Cookie (Sống 7 ngày)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày (milliseconds)
    });

    // Trả về thông tin cơ bản của user (không bao gồm token nữa vì đã nằm trong cookie)
    return {
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    // Clear cả 2 cookies khi logout
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return { message: 'Logged out successfully' };
  }
}