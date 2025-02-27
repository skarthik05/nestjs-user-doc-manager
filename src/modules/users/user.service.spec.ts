import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './users.service';
import { UserRepository } from './user.repository';
import { RolesService } from '../roles/roles.service';
import { CreateUserDto } from './dto/create-user.dto';
import {
  DetailsConflictException,
  DetailsNotFoundException,
} from '../../exceptions';
import { UserEntity } from 'src/database/entity/user.entity';
// Mock the transactional decorators
jest.mock('typeorm-transactional', () => ({
  Transactional: () => () => ({}),
  initializeTransactionalContext: () => {},
  addTransactionalDataSource: () => {},
}));

describe('UserService', () => {
  let service: UserService;
  let userRepository: UserRepository;
  let rolesService: RolesService;

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
          },
        },
        {
          provide: RolesService,
          useValue: {
            findById: jest.fn(),
            findDefaultRole: jest.fn(),
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
      jest
        .spyOn(userRepository, 'findByEmail')
        .mockResolvedValueOnce({
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

    it('should throw DetailsNotFoundException if role is not found', async () => {
      const createUserDto: CreateUserDto = {
        roleId: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
      };
      jest.spyOn(rolesService, 'findById').mockResolvedValueOnce(null);
      await expect(service.create(createUserDto)).rejects.toThrow(
        DetailsNotFoundException,
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
});
