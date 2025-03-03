import { type NullableType } from '../../common/types/nullable.type';
import { type User } from '../users/domain/user';
import { type Ingestion } from './domain/ingestion';

export abstract class IngestionRepository {
  abstract create(
    data: Omit<Ingestion, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Ingestion>;
  abstract findById(id: Ingestion['id']): Promise<NullableType<Ingestion>>;
  abstract findByUserId(userId: User['id']): Promise<Ingestion[]>;
  abstract findOne(
    id: Ingestion['id'],
    userId: User['id'],
  ): Promise<NullableType<Ingestion>>;
  abstract update(id: Ingestion['id'], data: Partial<Ingestion>): Promise<void>;
  abstract delete(id: Ingestion['id'], userId: User['id']): Promise<void>;
}
