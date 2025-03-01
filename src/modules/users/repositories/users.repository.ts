import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import { NullableType } from '../../../common/types/nullable.type';
import { UserEntity } from '../../../database/entity/user.entity';
import { UserSettingsEntity } from '../../../database/entity/user-settings.entity';
import { User } from '../domain/user';
import { UserSettings } from '../domain/user-setting';
import { UserRepository } from '../user.repository';
import { UserMapper } from './mappers/user.mapper';
import { UserSettingsMapper } from './mappers/user-settings.mapper';

@Injectable()
export class UsersRelationalRepository implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(UserSettingsEntity)
    private readonly userSettingsRepository: Repository<UserSettingsEntity>,
  ) {}

  async create(data: User): Promise<User> {
    const persistenceModel = UserMapper.toPersistence(data);
    const newEntity = await this.usersRepository.save(
      this.usersRepository.create(persistenceModel),
    );
    return UserMapper.toDomain(newEntity);
  }
  async findByEmail(email: User['email']): Promise<NullableType<User>> {
    if (!email) {
      return null;
    }
    const user = await this.usersRepository.findOne({
      where: {
        email,
      },
    });
    return user;
  }
  async createUserSettings(data: UserSettings): Promise<UserSettings> {
    const persistenceModel = UserSettingsMapper.toPersistence(data);
    const newEntity = await this.userSettingsRepository.save(
      this.userSettingsRepository.create(persistenceModel),
    );
    return newEntity;
  }
  async findOneBy(
    options: FindOptionsWhere<UserEntity>,
  ): Promise<NullableType<User>> {
    const user = await this.usersRepository.findOneBy(options);
    return user ? UserMapper.toDomain(user) : null;
  }
  async findById(id: number): Promise<NullableType<User>> {
    const user = await this.usersRepository.findOneBy({ id });
    return user ? UserMapper.toDomain(user) : null;
  }
}
