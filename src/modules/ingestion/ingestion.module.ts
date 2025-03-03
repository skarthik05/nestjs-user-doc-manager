import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestionEntity } from 'src/database/entity/ingestion.entity';

import { DocumentsModule } from '../documents/documents.module';
import { IngestionController } from './ingestion.controller';
import { IngestionRepository } from './ingestion.repository';
import { IngestionService } from './ingestion.service';
import { IngestionRelationalRepository } from './repositories/ingestion.repository';

@Module({
  imports: [TypeOrmModule.forFeature([IngestionEntity]), DocumentsModule],
  controllers: [IngestionController],
  providers: [
    IngestionService,
    {
      provide: IngestionRepository,
      useClass: IngestionRelationalRepository,
    },
  ],
  exports: [IngestionService],
})
export class IngestionModule {}
