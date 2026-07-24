import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from 'src/auth/auth.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}
    // find user by email and create new user
    async findUserByEmail(email: RegisterDto['email']) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }
    async createUser(data: RegisterDto) {
        return this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                hashedPassword: data.password,        
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    // validate user credentials
    async validateUser(data: LoginDto) {
        const { email, password } = data;
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                warehouseId: true,
                hashedPassword: true,
            }
        });
        if (!existingUser) {
            throw new UnauthorizedException('email or password is incorrect');
        }
        const isPasswordValid = await bcrypt.compare(password, existingUser.hashedPassword);
        if (!isPasswordValid) {
            throw new UnauthorizedException('email or password is incorrect');
        }
        return existingUser;
    }
    // update refresh token for user
    async createSession(userId: number, refreshToken: string, expiredAt: Date) {
    return this.prisma.session.create({
        data: {
            userId,
            refreshToken,
            expiredAt, // Bắt buộc truyền expiredAt theo Schema của bạn
        },
    });
}
}


