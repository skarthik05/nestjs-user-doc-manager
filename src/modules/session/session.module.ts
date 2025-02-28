import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SessionEntity } from '../../database/entity/user-session.entity';
import { SessionRelationalRepository } from './repositories/session.repository';
import { SessionRepository } from './session.repository';
import { SessionService } from './session.service';

@Module({
  imports: [TypeOrmModule.forFeature([SessionEntity])],
  providers: [
    SessionService,
    {
      provide: SessionRepository,
      useClass: SessionRelationalRepository,
    },
  ],
  exports: [SessionService],
})
export class SessionModule {}
