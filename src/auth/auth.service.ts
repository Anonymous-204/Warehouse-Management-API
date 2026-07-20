import { Injectable, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto } from './auth.dto';
@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ) {}
    async registerUser(data: RegisterDto) {
        const {name, email, password} = data;
        const existingUser = await this.usersService.findUserByEmail(email);
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }
        const SaltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, SaltRounds); 
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

        return { accessToken };
    }
}
