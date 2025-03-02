import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  DetailsConflictException,
  DetailsNotFoundException,
} from '../../exceptions/index';
import { FileType } from '../files/domain/file';
import { FilesService } from '../files/files.service';
import { User } from '../users/domain/user';
import { DocumentRepository } from './document.repository';
import { Document } from './domain/document';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly fileService: FilesService,
  ) {}

  async create(
    createDocumentDto: CreateDocumentDto,
    user: User,
  ): Promise<Document> {
    const [file, document] = await Promise.all([
      this.fileService.findById(createDocumentDto.fileId),
      this.documentRepository.findByFileId(createDocumentDto.fileId),
    ]);
    if (!file) {
      throw new NotFoundException(
        `File with ID ${createDocumentDto.fileId} not found`,
      );
    }
    if (document) {
      throw new BadRequestException(
        'File already attached to another document',
      );
    }

    return this.documentRepository.create({
      title: createDocumentDto.title,
      description: createDocumentDto.description,
      file: file as FileType,
      uploadedBy: user,
    });
  }

  async findAll(user: User): Promise<Document[]> {
    return this.documentRepository.findByUserId(user.id);
  }

  async findOne(id: number, user: User): Promise<Document> {
    const document = await this.documentRepository.findOne(id, user.id);

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    return document;
  }

  async remove(id: number, user: User): Promise<void> {
    const document = await this.findOne(id, user);

    await this.fileService.remove(document.file.id);

    await this.documentRepository.remove(document.id);
  }

  async update(
    id: number,
    updateDocumentDto: UpdateDocumentDto,
    user: User,
  ): Promise<void> {
    const userDocument = await this.findOne(id, user);
    if (!userDocument) {
      throw new NotFoundException(
        `Document with ID ${id} not found or not belongs to user`,
      );
    }
    if (updateDocumentDto.fileId) {
      const [file, document] = await Promise.all([
        this.fileService.findById(updateDocumentDto.fileId),
        this.documentRepository.findByFileId(updateDocumentDto.fileId),
      ]);
      if (!file) {
        throw new DetailsNotFoundException(
          'File',
          updateDocumentDto.fileId.toString(),
          'File',
        );
      }
      if (document) {
        throw new DetailsConflictException(
          'File',
          updateDocumentDto.fileId.toString(),
          'File',
        );
      }
      userDocument.file = file as FileType;
    }

    return this.documentRepository.update(id, {
      ...userDocument,
      ...updateDocumentDto,
    });
  }
}
