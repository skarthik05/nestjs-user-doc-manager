import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DocumentEntity } from '../../database/entity/document.entity';
import { FilesModule } from '../files/files.module';
import { DocumentRepository } from './document.repository';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentRelationalRepository } from './repositories/document.repository';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentEntity]), FilesModule],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    {
      provide: DocumentRepository,
      useClass: DocumentRelationalRepository,
    },
  ],
  exports: [DocumentsService],
})
export class DocumentsModule {}
