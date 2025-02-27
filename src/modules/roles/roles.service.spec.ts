import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { RoleRepository } from './role.repository';
import { RoleMapper } from './repositories/mappers/role.mapper';
import { RoleEntity } from 'src/database/entity/role.entity';

describe('RolesService', () => {
  let service: RolesService;
  let roleRepository: RoleRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: RoleRepository,
          useValue: {
            findById: jest.fn(),
            findDefaultRole: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    roleRepository = module.get<RoleRepository>(RoleRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return a role by id', async () => {
      const mockRoleEntity = {
        id: 1,
        name: 'Admin',
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      };
      const mockRole = RoleMapper.toDomain(
        mockRoleEntity as unknown as RoleEntity,
      );
      jest.spyOn(roleRepository, 'findById').mockResolvedValue(mockRole);

      const role = await service.findById(1);
      expect(role).toEqual(mockRole);
      expect(roleRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should return null if role not found', async () => {
      jest.spyOn(roleRepository, 'findById').mockResolvedValue(null);

      const role = await service.findById(999);
      expect(role).toBeNull();
      expect(roleRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('findDefaultRole', () => {
    it('should return the default role', async () => {
      const mockRoleEntity = {
        id: 2,
        name: 'User',
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      };
      const mockRole = RoleMapper.toDomain(
        mockRoleEntity as unknown as RoleEntity,
      );
      jest.spyOn(roleRepository, 'findDefaultRole').mockResolvedValue(mockRole);

      const role = await service.findDefaultRole();
      expect(role).toEqual(mockRole);
      expect(roleRepository.findDefaultRole).toHaveBeenCalled();
    });

    it('should return null if no default role is set', async () => {
      jest.spyOn(roleRepository, 'findDefaultRole').mockResolvedValue(null);

      const role = await service.findDefaultRole();
      expect(role).toBeNull();
      expect(roleRepository.findDefaultRole).toHaveBeenCalled();
    });
  });
});
