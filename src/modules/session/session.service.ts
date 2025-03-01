import { Injectable } from '@nestjs/common';

import { NullableType } from '../../common/types/nullable.type';
import { Session } from './domain/session';
import { SessionRepository } from './session.repository';

@Injectable()
export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  create(
    data: Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Session> {
    return this.sessionRepository.create(data);
  }

  findById(id: number): Promise<NullableType<Session>> {
    return this.sessionRepository.findById(id);
  }

  async update(
    id: number,
    payload: Partial<
      Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
    >,
  ): Promise<NullableType<Session>> {
    const session = await this.sessionRepository.findById(id);
    if (!session) {
      return null;
    }
    return this.sessionRepository.update(id, Object.assign(session, payload));
  }

  async deleteById(id: number): Promise<void> {
    await this.sessionRepository.deleteById(id);
  }
}
