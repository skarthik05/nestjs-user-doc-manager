import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRegisterDto } from './dto/user-register.dto';
import { UserLoginDto } from '../users/dto/user-login-dto';
import { LoginPayloadDto } from './dto/login-response.dto';
import { Request } from 'express';
import { RequestWithUser } from './dto/request-with-user.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockLoginPayload: LoginPayloadDto = {
    accessToken: 'mockAccessToken',
    refreshToken: 'mockRefreshToken',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            refreshToken: jest.fn(),
            logout: jest.fn().mockImplementation(() => Promise.resolve()),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register with correct parameters', async () => {
      const userRegisterDto: UserRegisterDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
      };
      await controller.register(userRegisterDto);
      expect(authService.register).toHaveBeenCalledWith(userRegisterDto);
    });
  });

  describe('login', () => {
    it('should call authService.login with correct parameters and return tokens', async () => {
      const loginDto: UserLoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(mockLoginPayload);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockLoginPayload);
    });
  });

  describe('refresh', () => {
    it('should call authService.refreshToken with correct parameters and return new tokens', async () => {
      const mockRequest = {
        ...({} as Request),
        user: {
          sessionId: 1,
          hash: 'mock-hash',
        },
      } as RequestWithUser;

      jest
        .spyOn(authService, 'refreshToken')
        .mockResolvedValue(mockLoginPayload);

      const result = await controller.refresh(mockRequest);

      expect(authService.refreshToken).toHaveBeenCalledWith({
        sessionId: mockRequest.user.sessionId,
        hash: mockRequest.user.hash,
      });
      expect(result).toEqual(mockLoginPayload);
    });
  });

  describe('logout', () => {
    it('should call authService.logout with correct session id', async () => {
      const mockRequest = {
        user: {
          sessionId: 1,
          hash: 'mock-hash',
        },
      } as RequestWithUser;

      await controller.logout(mockRequest);

      expect(authService.logout).toHaveBeenCalledWith({
        sessionId: mockRequest.user.sessionId,
      });
    });

    it('should return void when logout is successful', async () => {
      const mockRequest = {
        user: {
          sessionId: 1,
          hash: 'mock-hash',
        },
      } as RequestWithUser;

      const result = await controller.logout(mockRequest);

      expect(result).toBeUndefined();
    });
  });
});
