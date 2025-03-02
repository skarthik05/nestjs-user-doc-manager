import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NullableType } from 'src/common/types/nullable.type';
import { FileEntity } from 'src/database/entity/file.entity';
import { In, Repository } from 'typeorm';

import { FileType } from '../domain/file';
import { FileRepository } from '../file.repository';
import { FileMapper } from './mappers/file.mapper';

@Injectable()
export class FileRelationalRepository implements FileRepository {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
  ) {}

  async create(data: FileType): Promise<FileType> {
    const persistenceModel = FileMapper.toPersistence(data);
    const savedEntity = await this.fileRepository.save(
      this.fileRepository.create(persistenceModel),
    );
    return FileMapper.toDomain(savedEntity);
  }

  async findById(id: FileType['id']): Promise<NullableType<FileType>> {
    const entity = await this.fileRepository.findOne({
      where: {
        id,
      },
    });

    return entity ? FileMapper.toDomain(entity) : null;
  }

  async findByIds(ids: FileType['id'][]): Promise<FileType[]> {
    const entities = await this.fileRepository.find({
      where: {
        id: In(ids),
      },
    });

    return entities.map((entity) => FileMapper.toDomain(entity));
  }
}
