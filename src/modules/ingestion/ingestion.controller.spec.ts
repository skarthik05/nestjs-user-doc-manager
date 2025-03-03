import { Test, TestingModule } from '@nestjs/testing';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { User } from '../users/domain/user';
import { Ingestion, IngestionStatus } from './domain/ingestion';
import { TriggerIngestionDto } from './dto/trigger-ingestion.dto';
import { Document } from '../documents/domain/document';
import { UpdateIngestionDto } from './dto/update-ingestion.dto';

describe('IngestionController', () => {
  let controller: IngestionController;
  let ingestionService: IngestionService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
  } as User;

  const mockIngestion = {
    id: 1,
    status: IngestionStatus.PENDING,
    document: {
      id: 1,
      file: {
        originalName: 'test.pdf',
        mimeType: 'application/pdf',
        size: 1024,
      },
    } as Document,
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
      controllers: [IngestionController],
      providers: [
        {
          provide: IngestionService,
          useValue: {
            triggerIngestion: jest.fn(),
            getIngestionStatus: jest.fn(),
            listIngestion: jest.fn(),
            updateIngestion: jest.fn(),
            abortIngestion: jest.fn(),
            deleteIngestion: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<IngestionController>(IngestionController);
    ingestionService = module.get<IngestionService>(IngestionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('triggerIngestion', () => {
    it('should trigger document ingestion successfully', async () => {
      const dto: TriggerIngestionDto = { documentId: 1 };
      jest
        .spyOn(ingestionService, 'triggerIngestion')
        .mockResolvedValue(mockIngestion);

      const result = await controller.triggerIngestion(dto, mockUser);

      expect(result).toEqual(mockIngestion);
      expect(ingestionService.triggerIngestion).toHaveBeenCalledWith(
        dto,
        mockUser,
      );
    });
  });

  describe('getIngestionStatus', () => {
    it('should get ingestion status successfully', async () => {
      jest
        .spyOn(ingestionService, 'getIngestionStatus')
        .mockResolvedValue(mockIngestion);

      const result = await controller.getIngestionStatus(1, mockUser);

      expect(result).toEqual(mockIngestion);
      expect(ingestionService.getIngestionStatus).toHaveBeenCalledWith(
        1,
        mockUser,
      );
    });
  });

  describe('listIngestion', () => {
    it('should list all ingestions for user', async () => {
      const mockIngestions = [mockIngestion];
      jest
        .spyOn(ingestionService, 'listIngestion')
        .mockResolvedValue(mockIngestions);

      const result = await controller.listIngestion(mockUser);

      expect(result).toEqual(mockIngestions);
      expect(ingestionService.listIngestion).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('updateIngestion', () => {
    it('should update ingestion status successfully', async () => {
      const dto: UpdateIngestionDto = {
        status: IngestionStatus.COMPLETED,
        error: undefined,
      };
      const updatedIngestion = {
        ...mockIngestion,
        status: IngestionStatus.COMPLETED,
      };
      jest
        .spyOn(ingestionService, 'updateIngestion')
        .mockResolvedValue(updatedIngestion);

      const result = await controller.updateIngestion(1, dto, mockUser);

      expect(result).toEqual(updatedIngestion);
      expect(ingestionService.updateIngestion).toHaveBeenCalledWith(
        1,
        dto,
        mockUser,
      );
    });

    it('should update ingestion status with error message', async () => {
      const dto: UpdateIngestionDto = {
        status: IngestionStatus.FAILED,
        error: 'Processing failed',
      };
      const updatedIngestion = {
        ...mockIngestion,
        status: IngestionStatus.FAILED,
        error: 'Processing failed',
      };
      jest
        .spyOn(ingestionService, 'updateIngestion')
        .mockResolvedValue(updatedIngestion);

      const result = await controller.updateIngestion(1, dto, mockUser);

      expect(result).toEqual(updatedIngestion);
      expect(ingestionService.updateIngestion).toHaveBeenCalledWith(
        1,
        dto,
        mockUser,
      );
    });
  });

  describe('abortIngestion', () => {
    it('should abort ingestion successfully', async () => {
      const abortedIngestion = {
        ...mockIngestion,
        status: IngestionStatus.FAILED,
        error: 'Ingestion aborted by user',
      };
      jest
        .spyOn(ingestionService, 'abortIngestion')
        .mockResolvedValue(abortedIngestion);

      const result = await controller.abortIngestion(1, mockUser);

      expect(result).toEqual(abortedIngestion);
      expect(ingestionService.abortIngestion).toHaveBeenCalledWith(1, mockUser);
    });
  });

  describe('deleteIngestion', () => {
    it('should delete ingestion successfully', async () => {
      jest
        .spyOn(ingestionService, 'deleteIngestion')
        .mockResolvedValue(undefined);

      await controller.deleteIngestion(1, mockUser);

      expect(ingestionService.deleteIngestion).toHaveBeenCalledWith(
        1,
        mockUser,
      );
    });
  });
});
