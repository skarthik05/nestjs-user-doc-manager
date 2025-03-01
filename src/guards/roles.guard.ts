import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { RoleType } from '../common/types/role.type';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtPayloadType } from '../modules/auth/strategies/types/jwt-payload.type';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as JwtPayloadType;

    if (!this.isJwtPayload(user)) {
      return false;
    }

    return requiredRoles.some((role) => Number(user.roleId) === Number(role));
  }

  private isJwtPayload(user: JwtPayloadType): user is JwtPayloadType {
    return user && typeof user.roleId === 'number';
  }
}
