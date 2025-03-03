import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NullableType } from '../../../common/types/nullable.type';
import { IngestionEntity } from '../../../database/entity/ingestion.entity';
import { User } from '../../users/domain/user';
import { Ingestion } from '../domain/ingestion';
import { IngestionRepository } from '../ingestion.repository';
import { IngestionMapper } from './mappers/ingestion.mapper';

@Injectable()
export class IngestionRelationalRepository implements IngestionRepository {
  constructor(
    @InjectRepository(IngestionEntity)
    private readonly ingestionRepository: Repository<IngestionEntity>,
  ) {}

  async create(
    data: Omit<Ingestion, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Ingestion> {
    const persistenceModel = IngestionMapper.toPersistence(data);
    const savedEntity = await this.ingestionRepository.save(
      this.ingestionRepository.create(persistenceModel),
    );
    return IngestionMapper.toDomain(savedEntity);
  }

  async findById(id: Ingestion['id']): Promise<NullableType<Ingestion>> {
    const entity = await this.ingestionRepository.findOne({
      where: { id },
      relations: ['document', 'triggeredBy'],
    });

    return entity ? IngestionMapper.toDomain(entity) : null;
  }

  async findByUserId(userId: User['id']): Promise<Ingestion[]> {
    const entities = await this.ingestionRepository.find({
      where: { triggeredBy: { id: userId } },
      relations: ['document', 'triggeredBy'],
      order: { createdAt: 'DESC' },
    });

    return entities.map((entity) => IngestionMapper.toDomain(entity));
  }

  async findOne(
    id: Ingestion['id'],
    userId: User['id'],
  ): Promise<NullableType<Ingestion>> {
    const entity = await this.ingestionRepository.findOne({
      where: { id, triggeredBy: { id: userId } },
      relations: ['document', 'triggeredBy'],
    });
    return entity ? IngestionMapper.toDomain(entity) : null;
  }

  async update(id: Ingestion['id'], data: Partial<Ingestion>): Promise<void> {
    const persistenceModel = IngestionMapper.toPersistence(data);
    await this.ingestionRepository.update(id, {
      status: persistenceModel.status,
      error: persistenceModel.error,
      metadata: persistenceModel.metadata,
      document: persistenceModel.document,
      documentId: persistenceModel.documentId,
      triggeredBy: persistenceModel.triggeredBy,
      triggeredById: persistenceModel.triggeredById,
    });
  }

  async delete(id: Ingestion['id'], userId: User['id']): Promise<void> {
    const entity = await this.findOne(id, userId);
    if (entity) {
      await this.ingestionRepository.delete(id);
    }
  }
}
