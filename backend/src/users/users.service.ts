import { Injectable, UnauthorizedException, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from 'src/auth/auth.dto';
import {getEmployeesDto} from './users.dto'
import { AuthenticatedRequest } from 'src/auth/auth.middleware';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
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
        const {name, email, password} = data
        return this.prisma.user.create({
            data: {
                name: name,
                email: email,
                hashedPassword: password,        
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
    async getEmployees(data:getEmployeesDto, id:number,role:Role) {
        const {warehouseid} = data
        const listEmployees = await this.prisma.user.findMany({
            where: {
                warehouseId: role==='ADMIN'?undefined:warehouseid,
                id: {not:id}
            },
            select:{
                id:true,
                name:true,
                email: true,
                createdAt:true,
                warehouse: {
                    select:{
                        name:true
                    }
                }
            },
        });
        return listEmployees
    }
}


