import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {UserDto} from './users.dto';
@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}
    async findUserByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }
    async createUser(data: UserDto) {
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


