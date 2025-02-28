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
});
