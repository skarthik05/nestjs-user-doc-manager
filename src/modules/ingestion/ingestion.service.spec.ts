import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { IngestionRepository } from './ingestion.repository';
import { DocumentsService } from '../documents/documents.service';
import { User } from '../users/domain/user';
import { Document } from '../documents/domain/document';
import { Ingestion, IngestionStatus } from './domain/ingestion';
import { TriggerIngestionDto } from './dto/trigger-ingestion.dto';
import { UpdateIngestionDto } from './dto/update-ingestion.dto';

describe('IngestionService', () => {
  let service: IngestionService;
  let ingestionRepository: IngestionRepository;
  let documentsService: DocumentsService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
  } as User;

  const mockDocument = {
    id: 1,
    file: {
      originalName: 'test.pdf',
      mimeType: 'application/pdf',
      size: 1024,
    },
  } as Document;

  const mockIngestion = {
    id: 1,
    status: IngestionStatus.PENDING,
    document: mockDocument,
    triggeredBy: mockUser,
    metadata: {
      fileName: 'test.pdf',
      fileType: 'application/pdf',
      fileSize: 1024,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Ingestion;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestionService,
        {
          provide: IngestionRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByUserId: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: DocumentsService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<IngestionService>(IngestionService);
    ingestionRepository = module.get<IngestionRepository>(IngestionRepository);
    documentsService = module.get<DocumentsService>(DocumentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('triggerIngestion', () => {
    const dto: TriggerIngestionDto = { documentId: 1 };

    it('should create an ingestion record successfully', async () => {
      jest.spyOn(documentsService, 'findOne').mockResolvedValue(mockDocument);
      jest
        .spyOn(ingestionRepository, 'create')
        .mockResolvedValue(mockIngestion);

      const result = await service.triggerIngestion(dto, mockUser);

      expect(result).toEqual(mockIngestion);
      expect(documentsService.findOne).toHaveBeenCalledWith(
        dto.documentId,
        mockUser,
      );
      expect(ingestionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: IngestionStatus.PENDING,
          document: mockDocument,
          triggeredBy: mockUser,
        }),
      );
    });

    it('should throw NotFoundException when document is not found', async () => {
      jest
        .spyOn(documentsService, 'findOne')
        .mockResolvedValue(null as unknown as Document);

      await expect(service.triggerIngestion(dto, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getIngestionStatus', () => {
    it('should return ingestion status successfully', async () => {
      jest
        .spyOn(ingestionRepository, 'findOne')
        .mockResolvedValue(mockIngestion);

      const result = await service.getIngestionStatus(1, mockUser);

      expect(result).toEqual(mockIngestion);
      expect(ingestionRepository.findOne).toHaveBeenCalledWith(1, mockUser.id);
    });

    it('should throw NotFoundException when ingestion is not found', async () => {
      jest.spyOn(ingestionRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getIngestionStatus(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('listIngestion', () => {
    it('should return list of ingestions', async () => {
      const mockIngestions = [mockIngestion];
      jest
        .spyOn(ingestionRepository, 'findByUserId')
        .mockResolvedValue(mockIngestions);

      const result = await service.listIngestion(mockUser);

      expect(result).toEqual(mockIngestions);
      expect(ingestionRepository.findByUserId).toHaveBeenCalledWith(
        mockUser.id,
      );
    });
  });

  describe('updateIngestion', () => {
    const dto: UpdateIngestionDto = {
      status: IngestionStatus.COMPLETED,
    };

    it('should update ingestion successfully', async () => {
      jest
        .spyOn(ingestionRepository, 'findOne')
        .mockResolvedValue(mockIngestion);
      jest.spyOn(ingestionRepository, 'update').mockResolvedValue();

      const updatedIngestion = {
        ...mockIngestion,
        status: IngestionStatus.COMPLETED,
      };
      jest
        .spyOn(ingestionRepository, 'findOne')
        .mockResolvedValueOnce(updatedIngestion);

      const result = await service.updateIngestion(1, dto, mockUser);

      expect(result).toEqual(updatedIngestion);
      expect(ingestionRepository.update).toHaveBeenCalledWith(1, {
        status: dto.status,
        error: undefined,
      });
    });

    it('should throw NotFoundException when ingestion is not found', async () => {
      jest.spyOn(ingestionRepository, 'findOne').mockResolvedValue(null);

      await expect(service.updateIngestion(1, dto, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update ingestion with error message', async () => {
      const dtoWithError: UpdateIngestionDto = {
        status: IngestionStatus.FAILED,
        error: 'Processing failed',
      };

      jest
        .spyOn(ingestionRepository, 'findOne')
        .mockResolvedValue(mockIngestion);
      jest.spyOn(ingestionRepository, 'update').mockResolvedValue();

      const updatedIngestion = {
        ...mockIngestion,
        status: IngestionStatus.FAILED,
        error: 'Processing failed',
      };
      jest
        .spyOn(ingestionRepository, 'findOne')
        .mockResolvedValueOnce(updatedIngestion);

      const result = await service.updateIngestion(1, dtoWithError, mockUser);

      expect(result).toEqual(updatedIngestion);
      expect(ingestionRepository.update).toHaveBeenCalledWith(1, {
        status: dtoWithError.status,
        error: dtoWithError.error,
      });
    });
  });

  describe('abortIngestion', () => {
    it('should abort ingestion successfully', async () => {
      const pendingIngestion = {
        ...mockIngestion,
        status: IngestionStatus.PENDING,
      };

      jest
        .spyOn(ingestionRepository, 'findOne')
        .mockResolvedValueOnce(pendingIngestion);

      jest.spyOn(ingestionRepository, 'update').mockResolvedValue();

      const abortedIngestion = {
        ...mockIngestion,
        status: IngestionStatus.ABORT,
        error: 'Ingestion aborted by user',
      };
      jest
        .spyOn(ingestionRepository, 'findOne')
        .mockResolvedValueOnce(abortedIngestion);

      const result = await service.abortIngestion(1, mockUser);

      expect(result).toEqual(abortedIngestion);
      expect(ingestionRepository.update).toHaveBeenCalledWith(1, {
        status: IngestionStatus.ABORT,
        error: 'Ingestion aborted by user',
      });
    });

    it('should throw BadRequestException when trying to abort completed ingestion', async () => {
      const completedIngestion = {
        ...mockIngestion,
        status: IngestionStatus.COMPLETED,
      };
      jest
        .spyOn(ingestionRepository, 'findOne')
        .mockResolvedValue(completedIngestion);

      await expect(service.abortIngestion(1, mockUser)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.abortIngestion(1, mockUser)).rejects.toThrow(
        'Cannot abort ingestion with status COMPLETED',
      );
    });

    it('should throw BadRequestException when trying to abort failed ingestion', async () => {
      const failedIngestion = {
        ...mockIngestion,
        status: IngestionStatus.FAILED,
      };
      jest
        .spyOn(ingestionRepository, 'findOne')
        .mockResolvedValue(failedIngestion);

      await expect(service.abortIngestion(1, mockUser)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.abortIngestion(1, mockUser)).rejects.toThrow(
        'Cannot abort ingestion with status FAILED',
      );
    });

    it('should throw NotFoundException when ingestion is not found', async () => {
      jest.spyOn(ingestionRepository, 'findOne').mockResolvedValue(null);

      await expect(service.abortIngestion(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteIngestion', () => {
    it('should delete ingestion successfully', async () => {
      jest.spyOn(ingestionRepository, 'delete').mockResolvedValue();

      await service.deleteIngestion(1, mockUser);

      expect(ingestionRepository.delete).toHaveBeenCalledWith(1, mockUser.id);
    });
  });
});
