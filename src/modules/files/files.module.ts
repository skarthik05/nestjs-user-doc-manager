import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import dotenv from 'dotenv';

import { FileDriver } from '../../common/types/file-config.type';
import { ENV_CONSTANTS } from '../../constants/env.constants';
import { FileEntity } from '../../database/entity/file.entity';
import { FileRepository } from './file.repository';
import { FilesService } from './files.service';
import { FileRelationalRepository } from './repositories/file.repository';
import { FilesLocalModule } from './uploader/local/files.module';
import { FilesS3Module } from './uploader/s3/files.module';
import { FilesS3PresignedModule } from './uploader/s3-presigned/files.module';

dotenv.config();
const fileDriver = process.env[ENV_CONSTANTS.FILE_DRIVER];
const UploadModule =
  fileDriver === FileDriver.LOCAL
    ? FilesLocalModule
    : fileDriver === FileDriver.S3
      ? FilesS3Module
      : FilesS3PresignedModule;
@Module({
  imports: [TypeOrmModule.forFeature([FileEntity]), UploadModule],
  providers: [
    FilesService,
    {
      provide: FileRepository,
      useClass: FileRelationalRepository,
    },
  ],
  exports: [FilesService],
})
export class FilesModule {}
