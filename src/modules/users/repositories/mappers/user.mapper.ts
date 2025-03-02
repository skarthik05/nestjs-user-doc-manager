import { FileMapper } from 'src/modules/files/repositories/mappers/file.mapper';

import { RoleEntity } from '../../../../database/entity/role.entity';
import { UserEntity } from '../../../../database/entity/user.entity';
import { User } from '../../domain/user';
import { UserSettingsMapper } from './user-settings.mapper';

export class UserMapper {
  static toDomain(raw: UserEntity): User {
    const domainEntity = new User();
    domainEntity.id = raw.id;
    domainEntity.email = raw.email;
    domainEntity.firstName = raw.firstName;
    domainEntity.lastName = raw.lastName;
    if (raw.settings) {
      domainEntity.settings = UserSettingsMapper.toDomain(raw.settings);
    }
    if (raw.photo) {
      domainEntity.photo = FileMapper.toDomain(raw.photo);
    } else {
      domainEntity.photo = null;
    }

    domainEntity.role = raw.role;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt;
    domainEntity.role = raw.role;
    return domainEntity;
  }

  static toPersistence(domainEntity: User): UserEntity {
    let role: RoleEntity | undefined = undefined;

    if (domainEntity.role) {
      role = new RoleEntity();
      role.id = Number(domainEntity.role.id);
    }

    const persistenceEntity = new UserEntity();
    if (domainEntity.id && typeof domainEntity.id === 'number') {
      persistenceEntity.id = domainEntity.id;
    }
    if (domainEntity.settings) {
      persistenceEntity.settings = UserSettingsMapper.toPersistence(
        domainEntity.settings,
      );
    }
    if (domainEntity.photo) {
      persistenceEntity.photo = FileMapper.toPersistence(domainEntity.photo);
    }
    persistenceEntity.email = domainEntity.email;
    persistenceEntity.password = domainEntity.password;
    persistenceEntity.salt = domainEntity.salt;
    persistenceEntity.firstName = domainEntity.firstName;
    persistenceEntity.lastName = domainEntity.lastName;
    persistenceEntity.role = role;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    persistenceEntity.deletedAt = domainEntity.deletedAt;
    persistenceEntity.role = domainEntity.role;
    persistenceEntity.createdAt = domainEntity.createdAt;
    return persistenceEntity;
  }
}
