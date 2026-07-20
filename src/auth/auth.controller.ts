import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from '../users/users.dto';
import { LoginDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() data: UserDto) {
    return await this.authService.registerUser(data);
  }
  @Post('login')
  async login(@Body() dto: LoginDto) {
        return this.authService.loginUser(dto);
  }
}