import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NullableType } from '../../../common/types/nullable.type';
import { DocumentEntity } from '../../../database/entity/document.entity';
import { FileType } from '../../files/domain/file';
import { User } from '../../users/domain/user';
import { DocumentRepository } from '../document.repository';
import { Document } from '../domain/document';
import { DocumentMapper } from './mappers/document.mapper';

@Injectable()
export class DocumentRelationalRepository implements DocumentRepository {
  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
  ) {}

  async create(
    data: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Document> {
    const persistenceModel = DocumentMapper.toPersistence(data);
    const savedEntity = await this.documentRepository.save(
      this.documentRepository.create(persistenceModel),
    );
    return DocumentMapper.toDomain(savedEntity);
  }

  async findById(id: Document['id']): Promise<NullableType<Document>> {
    const entity = await this.documentRepository.findOne({
      where: { id },
      relations: ['file', 'uploadedBy'],
    });

    return entity ? DocumentMapper.toDomain(entity) : null;
  }

  async findByUserId(userId: User['id']): Promise<Document[]> {
    const entities = await this.documentRepository.find({
      where: { uploadedBy: { id: userId } },
      relations: ['file', 'uploadedBy'],
      order: { createdAt: 'DESC' },
    });

    return entities.map((entity) => DocumentMapper.toDomain(entity));
  }

  async findOne(
    id: Document['id'],
    userId: User['id'],
  ): Promise<NullableType<Document>> {
    const entity = await this.documentRepository.findOne({
      where: { id, uploadedBy: { id: userId } },
      relations: ['file', 'uploadedBy'],
    });

    return entity ? DocumentMapper.toDomain(entity) : null;
  }

  async remove(id: Document['id']): Promise<void> {
    await this.documentRepository.softDelete(id);
  }

  async findByFileId(fileId: FileType['id']): Promise<NullableType<Document>> {
    const entity = await this.documentRepository.findOne({
      where: { fileId },
    });
    return entity ? DocumentMapper.toDomain(entity) : null;
  }

  async update(id: Document['id'], data: Partial<Document>): Promise<void> {
    const persistenceModel = DocumentMapper.toPersistence(data);
    await this.documentRepository.update(id, persistenceModel);
  }
}
