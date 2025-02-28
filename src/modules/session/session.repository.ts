import { type Session } from './domain/session';

export abstract class SessionRepository {
  abstract create(
    data: Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Session>;
}
