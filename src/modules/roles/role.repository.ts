import { type NullableType } from '../../common/types/nullable.type';
import { type Role } from './domain/role';

export abstract class RoleRepository {
  abstract findDefaultRole(): Promise<NullableType<Role>>;
  abstract findById(id: number): Promise<NullableType<Role>>;
  abstract changeRole(userId: number, roleId: number): Promise<void>;
}
