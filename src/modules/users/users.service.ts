import { Injectable } from '@nestjs/common';
import { FindOptionsWhere } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import { NullableType } from '../../common/types/nullable.type';
import { BcryptUtil } from '../../common/utils';
import {
  DetailsConflictException,
  DetailsNotFoundException,
} from '../../exceptions';
import { FileType } from '../files/domain/file';
import { FilesService } from '../files/files.service';
import { Role } from '../roles/domain/role';
import { RolesService } from '../roles/roles.service';
import { User } from './domain/user';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly rolesService: RolesService,
    private readonly filesService: FilesService,
  ) {}

  @Transactional()
  async create(createUserDto: CreateUserDto): Promise<User> {
    let password: string | undefined = undefined;
    let salt: string | undefined = undefined;
    if (createUserDto.password) {
      salt = await BcryptUtil.getSalt();
      password = await BcryptUtil.hashPassword(createUserDto.password, salt);
    }

    let email: string | null = null;

    if (createUserDto.email) {
      const userObject = await this.usersRepository.findByEmail(
        createUserDto.email,
      );
      if (userObject) {
        throw new DetailsConflictException(
          'User',
          'email',
          createUserDto.email,
        );
      }
      email = createUserDto.email;
    }

    let role: Role | undefined = undefined;

    if (createUserDto.roleId) {
      const roleObject = await this.rolesService.findById(createUserDto.roleId);
      if (!roleObject) {
        throw new DetailsNotFoundException('Role', 'id', createUserDto.roleId);
      }
      role = roleObject;
    } else {
      const defaultRole = await this.rolesService.findDefaultRole();
      if (!defaultRole) {
        throw new DetailsNotFoundException('Role', 'default', 'default');
      }
      role = defaultRole;
    }

    let photo: FileType | null | undefined = undefined;

    if (createUserDto.photoId) {
      const fileObject = await this.filesService.findById(
        createUserDto.photoId,
      );
      if (!fileObject) {
        throw new DetailsNotFoundException('File', 'id', createUserDto.photoId);
      }
      photo = fileObject;
    } else if (createUserDto.photoId === null) {
      photo = null;
    }

    const user = await this.usersRepository.create({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      email: email,
      password,
      role,
      salt,
      photo,
    });
    await this.usersRepository.createUserSettings({
      userId: user.id,
      isEmailVerified: false,
      isPhoneVerified: false,
    });
    return user;
  }

  async login(email: User['email']): Promise<NullableType<User>> {
    return this.usersRepository.findByEmail(email);
  }
  async findOne(options: FindOptionsWhere<User>): Promise<NullableType<User>> {
    return this.usersRepository.findOneBy(options);
  }
  async findById(id: number): Promise<NullableType<User>> {
    return this.usersRepository.findById(id);
  }

  async changeRole(userId: number, roleId: number): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new DetailsNotFoundException('User', 'id', userId);
    }

    return this.rolesService.changeRole(userId, roleId);
  }
}
