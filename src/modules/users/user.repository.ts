import { type FindOptionsWhere } from 'typeorm';

import { type NullableType } from '../../common/types/nullable.type';
import { type User } from './domain/user';
import { type UserSettings } from './domain/user-setting';

export abstract class UserRepository {
  abstract create(
    data: Omit<User, 'id' | 'createdAt' | 'deletedAt' | 'updatedAt'>,
  ): Promise<User>;

  abstract findByEmail(email: User['email']): Promise<NullableType<User>>;

  abstract createUserSettings(
    data: Omit<UserSettings, 'id' | 'createdAt' | 'deletedAt' | 'updatedAt'>,
  ): Promise<UserSettings>;

  abstract findOneBy(
    options: FindOptionsWhere<User>,
  ): Promise<NullableType<User>>;
}
