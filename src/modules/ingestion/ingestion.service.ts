import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { DocumentsService } from '../documents/documents.service';
import { User } from '../users/domain/user';
import { Ingestion, IngestionStatus } from './domain/ingestion';
import { TriggerIngestionDto } from './dto/trigger-ingestion.dto';
import { UpdateIngestionDto } from './dto/update-ingestion.dto';
import { IngestionRepository } from './ingestion.repository';

@Injectable()
export class IngestionService {
  constructor(
    private readonly ingestionRepository: IngestionRepository,
    private readonly documentsService: DocumentsService,
  ) {}

  async triggerIngestion(
    dto: TriggerIngestionDto,
    user: User,
  ): Promise<Ingestion> {
    const document = await this.documentsService.findOne(dto.documentId, user);
    if (!document) {
      throw new NotFoundException(
        `Document with ID ${dto.documentId} not found`,
      );
    }

    const ingestion = await this.ingestionRepository.create({
      status: IngestionStatus.PENDING,
      document,
      triggeredBy: user,
      metadata: {
        fileName: document.file.originalName,
        fileType: document.file.mimeType,
        fileSize: document.file.size,
      },
    });

    // Here we should trigger actual ingestion process in Python backend

    return ingestion;
  }

  async getIngestionStatus(
    ingestionId: number,
    user: User,
  ): Promise<Ingestion> {
    const ingestion = await this.ingestionRepository.findOne(
      ingestionId,
      user.id,
    );

    if (!ingestion) {
      throw new NotFoundException(`Ingestion with ID ${ingestionId} not found`);
    }

    return ingestion;
  }

  async listIngestion(user: User): Promise<Ingestion[]> {
    return this.ingestionRepository.findByUserId(user.id);
  }

  async updateIngestionStatus(
    ingestionId: number,
    status: IngestionStatus,
    error?: string,
  ): Promise<void> {
    const ingestion = await this.ingestionRepository.findById(ingestionId);

    if (!ingestion) {
      throw new NotFoundException(`Ingestion with ID ${ingestionId} not found`);
    }

    await this.ingestionRepository.update(ingestionId, {
      status,
      error,
    });
  }

  async updateIngestion(
    ingestionId: number,
    dto: UpdateIngestionDto,
    user: User,
  ): Promise<Ingestion> {
    const ingestion = await this.getIngestionStatus(ingestionId, user);

    await this.ingestionRepository.update(ingestionId, {
      status: dto.status,
      error: dto.error,
    });

    return ingestion;
  }

  async abortIngestion(ingestionId: number, user: User): Promise<Ingestion> {
    const ingestion = await this.getIngestionStatus(ingestionId, user);

    if (
      ingestion.status === IngestionStatus.COMPLETED ||
      ingestion.status === IngestionStatus.FAILED
    ) {
      throw new BadRequestException(
        `Cannot abort ingestion with status ${ingestion.status}`,
      );
    }

    await this.ingestionRepository.update(ingestionId, {
      status: IngestionStatus.ABORT,
      error: 'Ingestion aborted by user',
    });

    return this.getIngestionStatus(ingestionId, user);
  }

  async deleteIngestion(ingestionId: number, user: User): Promise<void> {
    await this.ingestionRepository.delete(ingestionId, user.id);
  }
}
