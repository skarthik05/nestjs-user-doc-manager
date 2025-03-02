import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { RoleRepository } from './role.repository';
import { RoleMapper } from './repositories/mappers/role.mapper';
import { RoleEntity } from 'src/database/entity/role.entity';
import { DetailsNotFoundException } from '../../exceptions';

describe('RolesService', () => {
  let service: RolesService;
  let roleRepository: RoleRepository;

  const mockRoleEntity: RoleEntity = {
    id: 1,
    name: 'Admin',
    isDefault: false,
    isActive: true,
    description: 'Admin role',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: RoleRepository,
          useValue: {
            findById: jest.fn(),
            findDefaultRole: jest.fn(),
            changeRole: jest.fn(),
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
      const mockRole = RoleMapper.toDomain(mockRoleEntity);
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
      const mockDefaultRole = {
        ...mockRoleEntity,
        id: 2,
        name: 'User',
        isDefault: true,
      };
      const mockRole = RoleMapper.toDomain(mockDefaultRole);
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

  describe('changeRole', () => {
    it('should throw DetailsNotFoundException if role is not found', async () => {
      const userId = 1;
      const roleId = 999;
      jest.spyOn(roleRepository, 'findById').mockResolvedValue(null);

      await expect(service.changeRole(userId, roleId)).rejects.toThrow(
        DetailsNotFoundException,
      );
      expect(roleRepository.findById).toHaveBeenCalledWith(roleId);
    });

    it('should change user role successfully', async () => {
      const userId = 1;
      const roleId = 2;
      const mockNewRole = {
        ...mockRoleEntity,
        id: roleId,
      };
      const mockRole = RoleMapper.toDomain(mockNewRole);

      jest.spyOn(roleRepository, 'findById').mockResolvedValue(mockRole);
      jest.spyOn(roleRepository, 'changeRole').mockResolvedValue(undefined);

      await service.changeRole(userId, roleId);

      expect(roleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(roleRepository.changeRole).toHaveBeenCalledWith(userId, roleId);
    });
  });
});
