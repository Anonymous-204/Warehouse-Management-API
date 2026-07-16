import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findUserByEmail: jest.fn(),
    createUser: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      const dto = {
        email: 'test@gmail.com',
        password: '123456',
        name: 'John',
      };

      mockUsersService.findUserByEmail.mockResolvedValue(null);

      mockUsersService.createUser.mockResolvedValue({
        id: 1,
        email: dto.email,
        password: 'hashedPassword',
        name: dto.name,
      });

      const hashSpy = jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValue('hashedPassword' as never);

      const result = await service.registerUser(dto);

      expect(mockUsersService.findUserByEmail).toHaveBeenCalledWith(dto.email);

      expect(hashSpy).toHaveBeenCalledWith(dto.password, 10);

      expect(mockUsersService.createUser).toHaveBeenCalledWith({
        email: dto.email,
        password: 'hashedPassword',
        name: dto.name,
      });

      expect(result).toEqual({
        id: 1,
        email: dto.email,
        password: 'hashedPassword',
        name: dto.name,
      });
    });

    it('should throw error if email already exists', async () => {
      const dto = {
        email: 'test@gmail.com',
        password: '123456',
        name: 'John',
      };

      mockUsersService.findUserByEmail.mockResolvedValue({
        id: 1,
        email: dto.email,
      });

      await expect(service.registerUser(dto)).rejects.toThrow(
        'User with this email already exists',
      );

      expect(mockUsersService.createUser).not.toHaveBeenCalled();
    });

    it('should hash password before saving', async () => {
      const dto = {
        email: 'abc@gmail.com',
        password: '123456',
        name: 'ABC',
      };

      mockUsersService.findUserByEmail.mockResolvedValue(null);

      jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValue('myHashedPassword' as never);

      mockUsersService.createUser.mockResolvedValue({
        id: 2,
        email: dto.email,
        password: 'myHashedPassword',
        name: dto.name,
      });

      await service.registerUser(dto);

      expect(mockUsersService.createUser).toHaveBeenCalledWith({
        email: dto.email,
        password: 'myHashedPassword',
        name: dto.name,
      });
    });
  });
});