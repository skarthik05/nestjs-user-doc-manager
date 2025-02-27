import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NullableType } from '../../../common/types/nullable.type';
import { RoleEntity } from '../../../database/entity/role.entity';
import { Role } from '../domain/role';
import { RoleRepository } from '../role.repository';
import { RoleMapper } from './mappers/role.mapper';

@Injectable()
export class RoleRelationalRepository implements RoleRepository {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly rolesRepository: Repository<RoleEntity>,
  ) {}

  async findDefaultRole(): Promise<NullableType<Role>> {
    const role = await this.rolesRepository.findOne({
      where: {
        isDefault: true,
        isActive: true,
      },
    });
    return role ? RoleMapper.toDomain(role) : null;
  }

  async findById(id: number): Promise<NullableType<Role>> {
    const role = await this.rolesRepository.findOne({
      where: {
        id: id,
      },
    });
    return role ? RoleMapper.toDomain(role) : null;
  }
}
