import { DocumentEntity } from '../../../../database/entity/document.entity';
import { FileMapper } from '../../../files/repositories/mappers/file.mapper';
import { UserMapper } from '../../../users/repositories/mappers/user.mapper';
import { Document } from '../../domain/document';

export class DocumentMapper {
  static toDomain(entity: DocumentEntity): Document {
    const document = new Document();
    document.id = entity.id;
    document.title = entity.title;
    document.description = entity.description;
    if (entity.file) {
      document.file = FileMapper.toDomain(entity.file);
    }
    if (entity.uploadedBy) {
      document.uploadedBy = UserMapper.toDomain(entity.uploadedBy);
    }
    document.createdAt = entity.createdAt;
    document.updatedAt = entity.updatedAt;
    return document;
  }

  static toPersistence(domain: Partial<Document>): Partial<DocumentEntity> {
    const entity = new DocumentEntity();
    if (domain.title) entity.title = domain.title;
    if (domain.description) entity.description = domain.description;
    if (domain.file) {
      entity.file = FileMapper.toPersistence(domain.file);
    }
    if (domain.uploadedBy) {
      entity.uploadedBy = UserMapper.toPersistence(domain.uploadedBy);
    }
    return entity;
  }
}
