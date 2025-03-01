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
import { JwtRefreshPayloadType } from './strategies/types/jwt-refresh-payload.type';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => () => ({}),
}));
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

jest.mock('../../common/utils/crypto.util', () => ({
  CryptoUtil: {
    generateHash: jest.fn().mockReturnValue('newGeneratedHash123'),
  },
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

  const mockTokens = {
    accessToken: 'mockAccessToken',
    refreshToken: 'mockRefreshToken',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            login: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: SessionService,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            deleteById: jest.fn(),
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
          roleId: (mockUser.role as Role).id,
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

  describe('refreshToken', () => {
    const mockRefreshData: Pick<JwtRefreshPayloadType, 'sessionId' | 'hash'> = {
      sessionId: 1,
      hash: 'sessionHash123',
    };

    beforeEach(() => {
      jest
        .spyOn(jwtService, 'signAsync')
        .mockImplementation((payload: any, options?: any) => {
          return Promise.resolve(
            options?.secret === configService.authConfig.refreshSecret
              ? mockTokens.refreshToken
              : mockTokens.accessToken,
          );
        });
    });

    it('should successfully refresh tokens when session and user are valid', async () => {
      jest.spyOn(sessionService, 'findById').mockResolvedValue(mockSession);
      jest.spyOn(userService, 'findById').mockResolvedValue(mockUser);
      jest
        .spyOn(sessionService, 'update')
        .mockResolvedValue({ ...mockSession, hash: 'newGeneratedHash123' });

      const result = await service.refreshToken(mockRefreshData);
      expect(result).toEqual(mockTokens);
      expect(sessionService.findById).toHaveBeenCalledWith(
        mockRefreshData.sessionId,
      );
      expect(userService.findById).toHaveBeenCalledWith(mockSession.user.id);
      expect(sessionService.update).toHaveBeenCalledWith(mockSession.id, {
        hash: 'newGeneratedHash123',
      });
    });

    it('should throw UnauthorizedException when session is not found', async () => {
      jest.spyOn(sessionService, 'findById').mockResolvedValue(null);

      await expect(service.refreshToken(mockRefreshData)).rejects.toThrow(
        new UnauthorizedException('Session not found'),
      );
    });

    it('should throw UnauthorizedException when hash does not match', async () => {
      const sessionWithDifferentHash = {
        ...mockSession,
        hash: 'differentHash',
      };
      jest
        .spyOn(sessionService, 'findById')
        .mockResolvedValue(sessionWithDifferentHash);

      await expect(service.refreshToken(mockRefreshData)).rejects.toThrow(
        new UnauthorizedException('Invalid hash'),
      );
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      jest.spyOn(sessionService, 'findById').mockResolvedValue(mockSession);
      jest.spyOn(userService, 'findById').mockResolvedValue(null);

      await expect(service.refreshToken(mockRefreshData)).rejects.toThrow(
        new UnauthorizedException('User not found or has no role'),
      );
    });

    it('should throw UnauthorizedException when user has no role', async () => {
      const userWithoutRole = { ...mockUser, role: null };
      jest.spyOn(sessionService, 'findById').mockResolvedValue(mockSession);
      jest.spyOn(userService, 'findById').mockResolvedValue(userWithoutRole);

      await expect(service.refreshToken(mockRefreshData)).rejects.toThrow(
        new UnauthorizedException('User not found or has no role'),
      );
    });

    it('should generate new tokens with correct payload', async () => {
      jest.spyOn(sessionService, 'findById').mockResolvedValue(mockSession);
      jest.spyOn(userService, 'findById').mockResolvedValue(mockUser);
      jest
        .spyOn(sessionService, 'update')
        .mockResolvedValue({ ...mockSession, hash: 'newGeneratedHash123' });
      const jwtSpy = jest.spyOn(jwtService, 'signAsync');

      await service.refreshToken(mockRefreshData);

      expect(jwtSpy).toHaveBeenNthCalledWith(1, {
        id: mockUser.id,
        roleId: (mockUser.role as Role).id,
        sessionId: mockSession.id,
      });

      expect(jwtSpy).toHaveBeenNthCalledWith(
        2,
        {
          sessionId: mockSession.id,
          hash: 'newGeneratedHash123',
        },
        {
          secret: configService.authConfig.refreshSecret,
          expiresIn: configService.authConfig.refreshExpires,
        },
      );
    });
  });

  describe('logout', () => {
    it('should delete session by id', async () => {
      const sessionId = 1;
      const deleteByIdSpy = jest
        .spyOn(sessionService, 'deleteById')
        .mockResolvedValue(undefined);

      await service.logout({ sessionId });

      expect(deleteByIdSpy).toHaveBeenCalledWith(sessionId);
    });

    it('should handle non-existent session gracefully', async () => {
      const sessionId = 999;
      jest.spyOn(sessionService, 'deleteById').mockResolvedValue(undefined);

      await expect(service.logout({ sessionId })).resolves.not.toThrow();
    });
  });
});
