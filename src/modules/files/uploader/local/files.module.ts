import { BadRequestException, Module } from '@nestjs/common';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { diskStorage } from 'multer';

import { FileEntity } from '../../../../database/entity/file.entity';
import { ApiConfigService } from '../../../../shared/services/api-config.service';
import { FileRepository } from '../../file.repository';
import { FileRelationalRepository } from '../../repositories/file.repository';
import { FilesLocalController } from './files.controller';
import { FilesLocalService } from './files.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ApiConfigService],
      useFactory: (configService: ApiConfigService) => {
        return {
          fileFilter: (request, file, callback) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
              throw new BadRequestException('Invalid file type');
            }

            callback(null, true);
          },
          storage: diskStorage({
            destination: './files',
            filename: (request, file, callback) => {
              callback(
                null,
                `${randomStringGenerator()}.${file.originalname
                  .split('.')
                  .pop()
                  ?.toLowerCase()}`,
              );
            },
          }),
          limits: {
            fileSize: Number(configService.fileConfig.maxFileSize),
          },
        };
      },
    }),
  ],
  controllers: [FilesLocalController],
  providers: [
    FilesLocalService,
    {
      provide: FileRepository,
      useClass: FileRelationalRepository,
    },
  ],
  exports: [FilesLocalService],
})
export class FilesLocalModule {}
