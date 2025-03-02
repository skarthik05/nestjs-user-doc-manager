import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { RoleType } from '../common/types/role.type';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtPayloadType } from '../modules/auth/strategies/types/jwt-payload.type';

interface RequestWithUser extends Request {
  user: JwtPayloadType;
}

@Injectable()
export class JwtRolesGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    const authenticated = await super.canActivate(context);
    if (!authenticated) {
      return false;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!this.isValidJwtPayload(user)) {
      return false;
    }

    return requiredRoles.some((role) => Number(user.roleId) === Number(role));
  }

  handleRequest<TUser = JwtPayloadType>(
    err: Error,
    user: TUser | false,
  ): TUser {
    if (err || !user) {
      throw (
        err || new UnauthorizedException('Invalid token or no token provided')
      );
    }
    return user;
  }

  private isValidJwtPayload(user: JwtPayloadType): user is JwtPayloadType {
    return user && typeof user.roleId === 'number';
  }
}
