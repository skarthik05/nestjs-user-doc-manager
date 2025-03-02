import {
  createParamDecorator,
  type ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { type Request } from 'express';

import { type JwtPayloadType } from '../modules/auth/strategies/types/jwt-payload.type';
import { Role } from '../modules/roles/domain/role';
import { User } from '../modules/users/domain/user';

interface RequestWithUser extends Request {
  user?: JwtPayloadType;
}

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const userPayload = request.user;

    if (!userPayload) {
      throw new UnauthorizedException('User not found in request');
    }

    if (!userPayload.id || !userPayload.roleId) {
      throw new UnauthorizedException('Invalid user data in request');
    }

    const user = new User();
    user.id = userPayload.id;

    const role = new Role();
    role.id = userPayload.roleId;
    user.role = role;

    return user;
  },
);
