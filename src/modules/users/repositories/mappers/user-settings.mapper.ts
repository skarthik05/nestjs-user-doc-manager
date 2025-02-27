import { UserSettingsEntity } from '../../../../database/entity/user-settings.entity';
import { UserSettings } from '../../domain/user-setting';

export class UserSettingsMapper {
  static toDomain(entity: UserSettingsEntity): UserSettings {
    const domain = new UserSettings();
    domain.id = entity.id;
    domain.isEmailVerified = entity.isEmailVerified;
    domain.isPhoneVerified = entity.isPhoneVerified;
    domain.userId = entity.userId;
    return domain;
  }
  static toPersistence(domain: UserSettings): UserSettingsEntity {
    const persistence = new UserSettingsEntity();
    persistence.id = domain.id;
    persistence.isEmailVerified = domain.isEmailVerified;
    persistence.isPhoneVerified = domain.isPhoneVerified;
    persistence.userId = domain.userId;
    return persistence;
  }
}
