import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { Document } from './domain/document';
import { User } from '../users/domain/user';
import { FileType } from '../files/domain/file';
import { CreateDocumentDto } from './dto/create-document.dto';

describe('DocumentsController', () => {
  let controller: DocumentsController;
  let service: DocumentsService;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
  } as User;

  const mockFile = {
    id: 1,
    originalName: 'test.pdf',
    mimeType: 'application/pdf',
    path: '/uploads/test.pdf',
    size: 1024,
  } as FileType;

  const mockDocument = {
    id: 1,
    title: 'Test Document',
    description: 'Test Description',
    file: mockFile,
    uploadedBy: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Document;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [
        {
          provide: DocumentsService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockDocument),
            findAll: jest.fn().mockResolvedValue([mockDocument]),
            findOne: jest.fn().mockResolvedValue(mockDocument),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DocumentsController>(DocumentsController);
    service = module.get<DocumentsService>(DocumentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a document', async () => {
      const createDocumentDto: CreateDocumentDto = {
        title: 'Test Document',
        description: 'Test Description',
        fileId: 1,
      };

      const result = await controller.create(createDocumentDto, mockUser);
      expect(result).toEqual(mockDocument);
      expect(service.create).toHaveBeenCalledWith(createDocumentDto, mockUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of documents', async () => {
      const result = await controller.findAll(mockUser);
      expect(result).toEqual([mockDocument]);
      expect(service.findAll).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('findOne', () => {
    it('should return a document', async () => {
      const result = await controller.findOne(1, mockUser);
      expect(result).toEqual(mockDocument);
      expect(service.findOne).toHaveBeenCalledWith(1, mockUser);
    });
  });

  describe('remove', () => {
    it('should remove a document', async () => {
      await controller.remove(1, mockUser);
      expect(service.remove).toHaveBeenCalledWith(1, mockUser);
    });
  });
});
