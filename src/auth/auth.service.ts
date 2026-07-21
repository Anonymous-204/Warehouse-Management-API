// auth.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { LoginDto, RegisterDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  generateRandomToken(): string {
    return crypto.randomBytes(64).toString('hex'); // Chuỗi 128 ký tự
  }

  async registerUser(data: RegisterDto) {
    const { name, email, password } = data;
    const existingUser = await this.usersService.findUserByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Lưu ý: UsersService.createUser đã có hashed password
    const newUser = await this.usersService.createUser({
      name,
      email,
      password: hashedPassword,
    });
    return newUser;
  }

  async loginUser(data: LoginDto) {
    const user = await this.usersService.validateUser(data);
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    });

    const refreshToken = this.generateRandomToken();
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    // Hạn dùng Session DB: 7 ngày
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.usersService.createSession(user.id, hashedRefreshToken, expiresAt);

    // Trả cả 2 token về cho Controller
    return { accessToken, refreshToken, user };
  }
}