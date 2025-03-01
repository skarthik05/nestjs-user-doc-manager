import { Test, TestingModule } from '@nestjs/testing';
import { SessionService } from './session.service';
import { SessionRepository } from './session.repository';
import { Session } from './domain/session';
import { User } from '../users/domain/user';

describe('SessionService', () => {
  let service: SessionService;
  let sessionRepository: SessionRepository;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
  } as User;

  const mockSession = {
    id: 1,
    hash: 'testHash123',
    user: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Session;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: SessionRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
    sessionRepository = module.get<SessionRepository>(SessionRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a new session', async () => {
      const sessionData = {
        user: mockUser,
        hash: 'testHash123',
      };

      jest.spyOn(sessionRepository, 'create').mockResolvedValue(mockSession);

      const result = await service.create(sessionData);

      expect(result).toEqual(mockSession);
      expect(sessionRepository.create).toHaveBeenCalledWith(sessionData);
    });

    it('should pass through any errors from the repository', async () => {
      const sessionData = {
        user: mockUser,
        hash: 'testHash123',
      };

      const error = new Error('Database error');
      jest.spyOn(sessionRepository, 'create').mockRejectedValue(error);

      await expect(service.create(sessionData)).rejects.toThrow(error);
      expect(sessionRepository.create).toHaveBeenCalledWith(sessionData);
    });
  });

  describe('findById', () => {
    it('should return a session when found', async () => {
      jest.spyOn(sessionRepository, 'findById').mockResolvedValue(mockSession);

      const result = await service.findById(1);

      expect(result).toEqual(mockSession);
      expect(sessionRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should return null when session is not found', async () => {
      jest.spyOn(sessionRepository, 'findById').mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
      expect(sessionRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('update', () => {
    it('should successfully update an existing session', async () => {
      const updateData = { hash: 'newHash456' };
      const updatedSession = { ...mockSession, ...updateData };

      jest.spyOn(sessionRepository, 'findById').mockResolvedValue(mockSession);
      jest.spyOn(sessionRepository, 'update').mockResolvedValue(updatedSession);

      const result = await service.update(1, updateData);

      expect(result).toEqual(updatedSession);
      expect(sessionRepository.findById).toHaveBeenCalledWith(1);
      expect(sessionRepository.update).toHaveBeenCalledWith(1, {
        ...mockSession,
        ...updateData,
      });
    });

    it('should return null when trying to update non-existent session', async () => {
      const updateData = { hash: 'newHash456' };

      jest.spyOn(sessionRepository, 'findById').mockResolvedValue(null);

      const result = await service.update(999, updateData);

      expect(result).toBeNull();
      expect(sessionRepository.findById).toHaveBeenCalledWith(999);
      expect(sessionRepository.update).not.toHaveBeenCalled();
    });
  });
});
