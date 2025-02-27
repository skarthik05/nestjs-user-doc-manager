import { Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

import BcryptUtil from '../../common/bcrypt.util';
import {
  DetailsConflictException,
  DetailsNotFoundException,
} from '../../exceptions';
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

    const user = await this.usersRepository.create({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      email: email,
      password,
      role,
      salt,
    });
    await this.usersRepository.createUserSettings({
      userId: user.id,
      isEmailVerified: false,
      isPhoneVerified: false,
    });
    return user;
  }
}
