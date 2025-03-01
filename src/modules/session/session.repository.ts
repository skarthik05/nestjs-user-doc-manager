import { type NullableType } from 'src/common/types/nullable.type';

import { type Session } from './domain/session';

export abstract class SessionRepository {
  abstract create(
    data: Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Session>;
  abstract findById(id: number): Promise<NullableType<Session>>;
  abstract update(
    id: number,
    payload: Partial<
      Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
    >,
  ): Promise<Session>;
  abstract deleteById(id: number): Promise<void>;
}
