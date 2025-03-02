import { FileEntity } from 'src/database/entity/file.entity';

import { FileType } from '../../domain/file';

export class FileMapper {
  static toDomain(raw: FileEntity): FileType {
    const domainEntity = new FileType();
    domainEntity.id = raw.id;
    domainEntity.path = raw.path;
    domainEntity.originalName = raw.originalName;
    domainEntity.mimeType = raw.mimeType;
    domainEntity.size = raw.size;
    return domainEntity;
  }

  static toPersistence(domainEntity: FileType): FileEntity {
    const persistenceEntity = new FileEntity();
    persistenceEntity.id = domainEntity.id;
    persistenceEntity.path = domainEntity.path;
    persistenceEntity.originalName = domainEntity.originalName;
    persistenceEntity.mimeType = domainEntity.mimeType;
    persistenceEntity.size = domainEntity.size;
    return persistenceEntity;
  }
}
