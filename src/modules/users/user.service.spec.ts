import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './users.service';
import { UserRepository } from './user.repository';
import { RolesService } from '../roles/roles.service';
import { CreateUserDto } from './dto/create-user.dto';
import {
  DetailsConflictException,
  DetailsNotFoundException,
} from '../../exceptions';
import { UserEntity } from '../../database/entity/user.entity';
jest.mock('typeorm-transactional', () => ({
  Transactional: () => () => ({}),
  initializeTransactionalContext: () => {},
  addTransactionalDataSource: () => {},
}));

describe('UserService', () => {
  let service: UserService;
  let userRepository: UserRepository;
  let rolesService: RolesService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashedPassword',
    roleId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null as Date | null,
  } as UserEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
            createUserSettings: jest.fn(),
            findOneBy: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: RolesService,
          useValue: {
            findById: jest.fn(),
            findDefaultRole: jest.fn(),
            changeRole: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
    rolesService = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw DetailsConflictException if email already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
        roleId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as UserEntity);
      await expect(service.create(createUserDto)).rejects.toThrow(
        DetailsConflictException,
      );
    });

    it('should create a user with default role if no role is provided', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
      };

      const defaultRole = {
        id: 1,
        name: 'Default Role',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
        isActive: true,
        isDefault: true,
        description: '',
      };

      jest
        .spyOn(rolesService, 'findDefaultRole')
        .mockResolvedValueOnce(defaultRole);
      jest
        .spyOn(userRepository, 'create')
        .mockResolvedValueOnce({} as UserEntity);

      await service.create(createUserDto);
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          role: defaultRole,
        }),
      );
    });
  });

  describe('login', () => {
    it('should return user when found by email', async () => {
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(mockUser);

      const result = await service.login('test@example.com');

      expect(result).toEqual(mockUser);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
    });

    it('should return null when user is not found', async () => {
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);

      const result = await service.login('nonexistent@example.com');

      expect(result).toBeNull();
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        'nonexistent@example.com',
      );
    });
  });

  describe('changeRole', () => {
    it('should throw DetailsNotFoundException if user is not found', async () => {
      jest.spyOn(userRepository, 'findById').mockResolvedValue(null);

      await expect(service.changeRole(999, 1)).rejects.toThrow(
        DetailsNotFoundException,
      );
      expect(userRepository.findById).toHaveBeenCalledWith(999);
    });

    it('should change user role successfully', async () => {
      const userId = 1;
      const roleId = 2;

      jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(rolesService, 'changeRole').mockResolvedValue(undefined);

      await service.changeRole(userId, roleId);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(rolesService.changeRole).toHaveBeenCalledWith(userId, roleId);
    });
  });
});
