import { UserEntity } from '../../../../database/entity/user.entity';
import { SessionEntity } from '../../../../database/entity/user-session.entity';
import { UserMapper } from '../../../users/repositories/mappers/user.mapper';
import { Session } from '../../domain/session';

export class SessionMapper {
  static toDomain(raw: SessionEntity): Session {
    const domainEntity = new Session();
    domainEntity.id = raw.id;

    if (raw.user) {
      domainEntity.user = UserMapper.toDomain(raw.user);
    }

    domainEntity.hash = raw.hash;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt;
    return domainEntity;
  }
  static toPersistence(domainEntity: Session): SessionEntity {
    const persistenceSchema = new UserEntity();
    persistenceSchema.id = domainEntity.user.id;
    const sessionEntity = new SessionEntity();
    sessionEntity.id = domainEntity.id;
    sessionEntity.user = persistenceSchema;
    sessionEntity.hash = domainEntity.hash;
    sessionEntity.createdAt = domainEntity.createdAt;
    sessionEntity.updatedAt = domainEntity.updatedAt;
    sessionEntity.deletedAt = domainEntity.deletedAt;
    return sessionEntity;
  }
}
