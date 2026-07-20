import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from 'src/auth/auth.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}
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
                hashed_password: true,
            }
        });
        if (!existingUser) {
            throw new UnauthorizedException('email or password is incorrect');
        }
        const isPasswordValid = await bcrypt.compare(password, existingUser.hashed_password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('email or password is incorrect');
        }
        return existingUser;
    }
    // find user by email and create new user
    async findUserByEmail(email: RegisterDto['email']) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }
    async createUser(data: RegisterDto) {
        return this.prisma.user.create({
            data: {
                email: data.email,
                hashed_password: data.password,
                name: data.name
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
}


