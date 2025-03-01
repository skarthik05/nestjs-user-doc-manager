import { SetMetadata } from '@nestjs/common';

import { type RoleType } from '../common/types/role.type';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleType[]) => SetMetadata(ROLES_KEY, roles);
