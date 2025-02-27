import { RoleEntity } from '../../../../database/entity/role.entity';
import { Role } from '../../domain/role';

export class RoleMapper {
  static toDomain(raw: RoleEntity): Role {
    const domainEntity = new Role();
    domainEntity.id = raw.id;
    domainEntity.name = raw.name;
    domainEntity.description = raw.description;
    domainEntity.isActive = raw.isActive;
    domainEntity.isDefault = raw.isDefault;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt;

    return domainEntity;
  }

  static toPersistence(
    domainEntity: Omit<Role, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): RoleEntity {
    const persistenceEntity = new RoleEntity();

    persistenceEntity.name = domainEntity.name;
    persistenceEntity.description = domainEntity.description;
    persistenceEntity.isActive = domainEntity.isActive;
    persistenceEntity.isDefault = domainEntity.isDefault;

    return persistenceEntity;
  }
}
