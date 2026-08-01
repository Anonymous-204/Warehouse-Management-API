// auth.controller.ts
import { Controller, Post, Body, Res, Req, HttpCode, HttpStatus } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';
import { request } from 'https';

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

    

    // Set Refresh Token Cookie (Sống 7 ngày)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày (milliseconds)
    });

    // Trả về thông tin cơ bản của user (không bao gồm token nữa vì đã nằm trong cookie)
    return {
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        warehouseId: user.warehouseId,
      },
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    // Clear cookies khi logout
    res.clearCookie('refreshToken');
    return { message: 'Đăng xuất thành công' };
  }
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req:Request,
    @Res({passthrough:true}) res: Response
  ){
    const refreshToken = req.cookies?.['refreshToken']
    const result = await this.authService.refreshToken(refreshToken)
    return { accessToken: result.accessToken };
  }

}