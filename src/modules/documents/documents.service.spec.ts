import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';

import { DocumentsService } from './documents.service';
import { Document } from './domain/document';
import { FilesService } from '../files/files.service';
import { User } from '../users/domain/user';
import { FileType } from '../files/domain/file';
import { CreateDocumentDto } from './dto/create-document.dto';
import { DocumentRepository } from './document.repository';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let documentRepository: DocumentRepository;
  let filesService: FilesService;

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
      providers: [
        DocumentsService,
        {
          provide: DocumentRepository,
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockDocument),
            findByUserId: jest.fn().mockResolvedValue([mockDocument]),
            create: jest.fn().mockResolvedValue(mockDocument),
            remove: jest.fn().mockResolvedValue(undefined),
            findByFileId: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: FilesService,
          useValue: {
            findById: jest.fn().mockResolvedValue(mockFile),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    documentRepository = module.get<DocumentRepository>(DocumentRepository);
    filesService = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a document', async () => {
      const createDocumentDto: CreateDocumentDto = {
        title: 'Test Document',
        description: 'Test Description',
        fileId: 1,
      };

      const result = await service.create(createDocumentDto, mockUser);
      expect(result).toEqual(mockDocument);
      expect(filesService.findById).toHaveBeenCalledWith(
        createDocumentDto.fileId,
      );
      expect(documentRepository.findByFileId).toHaveBeenCalledWith(
        createDocumentDto.fileId,
      );
      expect(documentRepository.create).toHaveBeenCalledWith({
        title: createDocumentDto.title,
        description: createDocumentDto.description,
        file: mockFile,
        uploadedBy: mockUser,
      });
    });

    it('should throw NotFoundException when file not found', async () => {
      jest.spyOn(filesService, 'findById').mockResolvedValueOnce(null);
      const createDocumentDto: CreateDocumentDto = {
        title: 'Test Document',
        description: 'Test Description',
        fileId: 999,
      };

      await expect(service.create(createDocumentDto, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when file is already attached to another document', async () => {
      jest
        .spyOn(documentRepository, 'findByFileId')
        .mockResolvedValueOnce(mockDocument);
      const createDocumentDto: CreateDocumentDto = {
        title: 'Test Document',
        description: 'Test Description',
        fileId: 1,
      };

      await expect(service.create(createDocumentDto, mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of documents', async () => {
      const result = await service.findAll(mockUser);
      expect(result).toEqual([mockDocument]);
      expect(documentRepository.findByUserId).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('findOne', () => {
    it('should return a document', async () => {
      const result = await service.findOne(1, mockUser);
      expect(result).toEqual(mockDocument);
      expect(documentRepository.findOne).toHaveBeenCalledWith(1, mockUser.id);
    });

    it('should throw NotFoundException when document not found', async () => {
      jest.spyOn(documentRepository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.findOne(999, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a document', async () => {
      await service.remove(1, mockUser);
      expect(filesService.remove).toHaveBeenCalledWith(mockDocument.file.id);
      expect(documentRepository.remove).toHaveBeenCalledWith(mockDocument.id);
    });

    it('should throw NotFoundException when document not found', async () => {
      jest.spyOn(documentRepository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.remove(999, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
