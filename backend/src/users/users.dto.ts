import { IsEmail, IsInt, IsNotEmpty, IsString } from 'class-validator';
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

export class getEmployeesDto {
    @IsNotEmpty()
    @IsInt()
    warehouseid!:number

    
}