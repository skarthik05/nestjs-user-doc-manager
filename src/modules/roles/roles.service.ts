import { Injectable } from '@nestjs/common';

import { NullableType } from '../../common/types/nullable.type';
import { Role } from './domain/role';
import { RoleRepository } from './role.repository';

@Injectable()
export class RolesService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async findById(id: number): Promise<NullableType<Role>> {
    return this.roleRepository.findById(id);
  }
  async findDefaultRole(): Promise<NullableType<Role>> {
    return this.roleRepository.findDefaultRole();
  }
}
