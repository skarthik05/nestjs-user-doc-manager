import { type NullableType } from '../../common/types/nullable.type';
import { type FileType } from '../files/domain/file';
import { type User } from '../users/domain/user';
import { type Document } from './domain/document';

export abstract class DocumentRepository {
  abstract create(
    data: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Document>;
  abstract findById(id: Document['id']): Promise<NullableType<Document>>;
  abstract findByUserId(userId: User['id']): Promise<Document[]>;
  abstract findOne(
    id: Document['id'],
    userId: User['id'],
  ): Promise<NullableType<Document>>;
  abstract remove(id: Document['id']): Promise<void>;
  abstract findByFileId(
    fileId: FileType['id'],
  ): Promise<NullableType<Document>>;
  abstract update(id: Document['id'], data: Partial<Document>): Promise<void>;
}
