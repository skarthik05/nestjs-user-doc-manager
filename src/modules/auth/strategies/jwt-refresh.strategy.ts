import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ApiConfigService } from '../../../shared/services/api-config.service';
import { JwtRefreshPayloadType } from './types/jwt-refresh-payload.type';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ApiConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.authConfig.refreshSecret,
    });
  }

  public validate(payload: JwtRefreshPayloadType): JwtRefreshPayloadType {
    if (!payload.sessionId) {
      throw new UnauthorizedException();
    }

    return payload;
  }
}
