import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString,  } from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '@prisma/client';
export class UserDto {
    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsNotEmpty()
    @IsEmail()
    email!: string;

    @IsNotEmpty()
    @IsString()
    password!: string;
}
