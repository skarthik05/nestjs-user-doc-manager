import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '../../database/entity/user.entity';
import { UserSettingsEntity } from '../../database/entity/user-settings.entity';
import { RolesModule } from '../roles/roles.module';
import { UsersRelationalRepository } from './repositories/users.repository';
import { UserRepository } from './user.repository';
import { UserController } from './users.controller';
import { UserService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserSettingsEntity]),
    RolesModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: UserRepository,
      useClass: UsersRelationalRepository,
    },
  ],
  exports: [UserService],
})
export class UserModule {}
