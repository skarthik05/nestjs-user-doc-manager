import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NullableType } from 'src/common/types/nullable.type';
import { Repository } from 'typeorm';

import { SessionEntity } from '../../../database/entity/user-session.entity';
import { Session } from '../domain/session';
import { SessionRepository } from '../session.repository';
import { SessionMapper } from './mappers/session.mapper';

@Injectable()
export class SessionRelationalRepository implements SessionRepository {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
  ) {}

  async create(data: Session): Promise<Session> {
    const persistenceModel = SessionMapper.toPersistence(data);
    return this.sessionRepository.save(
      this.sessionRepository.create(persistenceModel),
    );
  }

  async findById(id: number): Promise<NullableType<Session>> {
    const session = await this.sessionRepository.findOne({
      where: { id },
    });
    return session ? SessionMapper.toDomain(session) : null;
  }

  async update(
    id: number,
    payload: Partial<
      Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
    >,
  ): Promise<Session> {
    const persistenceModel = SessionMapper.toPersistence({
      id,
      ...payload,
    } as Session);
    const updatedDetails = await this.sessionRepository.save(persistenceModel);
    return SessionMapper.toDomain(updatedDetails);
  }
}
