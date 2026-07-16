import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserDto } from '../users/users.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
    constructor(private readonly usersService: UsersService) {}
    async registerUser(data: UserDto) {
        const {email, password, name} = data;
        const existingUser = await this.usersService.findUserByEmail(email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        const SaltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, SaltRounds);
        const newUser = await this.usersService.createUser({
            email,
            password: hashedPassword,
            name
        });
        return newUser;
    }
}
