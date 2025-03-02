import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RoleEntity } from '../../database/entity/role.entity';
import { UserEntity } from '../../database/entity/user.entity';
import { RoleRelationalRepository } from './repositories/role.repository';
import { RoleRepository } from './role.repository';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity, UserEntity])],
  controllers: [RolesController],
  providers: [
    RolesService,
    {
      provide: RoleRepository,
      useClass: RoleRelationalRepository,
    },
  ],
  exports: [RolesService],
})
export class RolesModule {}
