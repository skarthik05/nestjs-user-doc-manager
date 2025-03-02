import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Transactional } from 'typeorm-transactional';

import { BcryptUtil, CryptoUtil } from '../../common/utils';
import {
  DetailsNotFoundException,
  InvalidPasswordException,
} from '../../exceptions';
import { ApiConfigService } from '../../shared/services/api-config.service';
import { Role } from '../roles/domain/role';
import { Session } from '../session/domain/session';
import { SessionService } from '../session/session.service';
import { User } from '../users/domain/user';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserLoginDto } from '../users/dto/user-login-dto';
import { UserService } from '../users/users.service';
import { LoginPayloadDto } from './dto/login-response.dto';
import { JwtRefreshPayloadType } from './strategies/types/jwt-refresh-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
    private readonly configService: ApiConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<void> {
    // We're not returning any user data after registration because the user needs to verify their email first.
    // Once they sign up, they'll receive a verification email with a unique link.
    // Until they verify their email, they won't be able to log in.
    // So for now, we're just sending back a status to confirm that the registration request was received.

    await this.userService.create(createUserDto);
  }

  @Transactional()
  async login(loginDto: UserLoginDto): Promise<LoginPayloadDto> {
    const user = await this.userService.login(loginDto.email);
    if (!user) {
      throw new DetailsNotFoundException('User', 'email', loginDto.email);
    }
    if (!user.role) {
      throw new UnauthorizedException('User has no role assigned');
    }
    if (!user.salt) {
      throw new UnauthorizedException('User has no salt configured');
    }
    const hashPassword = await BcryptUtil.hashPassword(
      loginDto.password,
      user.salt,
    );
    if (hashPassword !== user.password) {
      throw new InvalidPasswordException();
    }
    const hash = CryptoUtil.generateHash();

    const session = await this.sessionService.create({
      user,
      hash,
    });

    const { accessToken, refreshToken } = await this.getTokensData({
      id: user.id,
      roleId: user.role.id,
      sessionId: session.id,
      hash,
    });

    return {
      refreshToken,
      accessToken,
    };
  }
  private async getTokensData(data: {
    id: User['id'];
    roleId: Role['id'];
    sessionId: Session['id'];
    hash: Session['hash'];
  }) {
    const { refreshSecret, refreshExpires } = this.configService.authConfig;

    const [accessToken, refreshToken] = await Promise.all([
      await this.jwtService.signAsync({
        id: data.id,
        roleId: data.roleId,
        sessionId: data.sessionId,
      }),
      await this.jwtService.signAsync(
        {
          sessionId: data.sessionId,
          hash: data.hash,
        },
        {
          secret: refreshSecret,
          expiresIn: refreshExpires,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
  async refreshToken(
    data: Pick<JwtRefreshPayloadType, 'sessionId' | 'hash'>,
  ): Promise<LoginPayloadDto> {
    const session = await this.sessionService.findById(data.sessionId);

    if (!session) {
      throw new UnauthorizedException('Session not found');
    }
    if (session.hash !== data.hash) {
      throw new UnauthorizedException('Invalid hash');
    }

    const hash = CryptoUtil.generateHash();
    const user = await this.userService.findById(session.user.id);

    if (!user || !user.role) {
      throw new UnauthorizedException('User not found or has no role');
    }

    await this.sessionService.update(session.id, {
      hash,
    });

    const { accessToken, refreshToken } = await this.getTokensData({
      id: session.user.id,
      roleId: user.role.id,
      sessionId: session.id,
      hash,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async logout(data: Pick<JwtRefreshPayloadType, 'sessionId'>): Promise<void> {
    await this.sessionService.deleteById(data.sessionId);
  }
}
