import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { SessionService } from '../session/session.service';
import { ApiConfigService } from '../../shared/services/api-config.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import {
  DetailsNotFoundException,
  InvalidPasswordException,
} from '../../exceptions';
import { User } from '../users/domain/user';
import { Role } from '../roles/domain/role';
import { Session } from '../session/domain/session';

jest.mock('../../common/utils/bcrypt.util', () => ({
  BcryptUtil: {
    hashPassword: jest.fn().mockImplementation((password, salt) => {
      if (password === 'hashedPassword123') {
        return 'hashedPassword123';
      }
      return 'wrongHash';
    }),
  },
}));

jest.mock('typeorm-transactional', () => ({
  Transactional: () => () => ({}),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let sessionService: SessionService;
  let jwtService: JwtService;
  let configService: ApiConfigService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword123',
    salt: 'mockedSalt',
    role: {
      id: 1,
      name: 'user',
    } as Role,
  } as User;

  const mockSession = {
    id: 1,
    hash: 'sessionHash123',
    user: mockUser,
  } as Session;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            login: jest.fn(),
          },
        },
        {
          provide: SessionService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: ApiConfigService,
          useValue: {
            authConfig: {
              jwtSecret: 'jwtSecret',
              jwtExpirationTime: '1h',
              refreshSecret: 'refreshSecret',
              refreshExpires: '7d',
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    sessionService = module.get<SessionService>(SessionService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ApiConfigService>(ApiConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should call userService.create with correct parameters', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
      };
      await service.register(createUserDto);
      expect(userService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw an error if userService.create fails', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
      };
      jest
        .spyOn(userService, 'create')
        .mockRejectedValueOnce(new Error('Error'));
      await expect(service.register(createUserDto)).rejects.toThrow('Error');
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'hashedPassword123',
    };

    const mockTokens = {
      accessToken: 'mockAccessToken',
      refreshToken: 'mockRefreshToken',
    };

    beforeEach(() => {
      jest.spyOn(jwtService, 'signAsync').mockImplementation((payload: any) => {
        return Promise.resolve(
          payload.hash ? mockTokens.refreshToken : mockTokens.accessToken,
        );
      });
    });

    it('should successfully login a user and return tokens', async () => {
      jest.spyOn(userService, 'login').mockResolvedValue(mockUser);
      jest.spyOn(sessionService, 'create').mockResolvedValue(mockSession);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      });
      expect(userService.login).toHaveBeenCalledWith(loginDto.email);
      expect(sessionService.create).toHaveBeenCalled();
    });

    it('should throw DetailsNotFoundException when user is not found', async () => {
      jest.spyOn(userService, 'login').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        DetailsNotFoundException,
      );
      expect(userService.login).toHaveBeenCalledWith(loginDto.email);
    });

    it('should throw UnauthorizedException when user has no role', async () => {
      const userWithoutRole = { ...mockUser, role: null };
      jest.spyOn(userService, 'login').mockResolvedValue(userWithoutRole);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw InvalidPasswordException when password is incorrect', async () => {
      jest.spyOn(userService, 'login').mockResolvedValue(mockUser);

      await expect(
        service.login({
          email: loginDto.email,
          password: 'wrongPassword',
        }),
      ).rejects.toThrow(InvalidPasswordException);
    });

    it('should create a new session with correct data', async () => {
      jest.spyOn(userService, 'login').mockResolvedValue(mockUser);
      const sessionSpy = jest
        .spyOn(sessionService, 'create')
        .mockResolvedValue(mockSession);

      await service.login(loginDto);

      expect(sessionSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          user: mockUser,
          hash: expect.any(String),
        }),
      );
    });

    it('should generate both access and refresh tokens with correct payload', async () => {
      jest.spyOn(userService, 'login').mockResolvedValue(mockUser);
      jest.spyOn(sessionService, 'create').mockResolvedValue(mockSession);
      const jwtSpy = jest.spyOn(jwtService, 'signAsync');

      await service.login(loginDto);

      // Verify first call (access token)
      expect(jwtSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          id: mockUser.id,
          roleId: mockUser.role?.id,
          sessionId: mockSession.id,
        }),
      );

      // Verify second call (refresh token)
      expect(jwtSpy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          sessionId: mockSession.id,
          hash: expect.any(String),
        }),
        {
          secret: configService.authConfig.refreshSecret,
          expiresIn: configService.authConfig.refreshExpires,
        },
      );
    });
  });
});
