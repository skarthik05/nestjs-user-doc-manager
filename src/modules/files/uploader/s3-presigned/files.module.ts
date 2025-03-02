import { S3Client } from '@aws-sdk/client-s3';
import {
  HttpStatus,
  Module,
  UnprocessableEntityException,
} from '@nestjs/common';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import multerS3 from 'multer-s3';
import { ApiConfigService } from 'src/shared/services/api-config.service';

import { FileEntity } from '../../../../database/entity/file.entity';
import { FileRepository } from '../../file.repository';
import { FileRelationalRepository } from '../../repositories/file.repository';
import { FilesS3PresignedController } from './files.controller';
import { FilesS3PresignedService } from './files.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ApiConfigService],
      useFactory: (configService: ApiConfigService) => {
        const s3 = new S3Client({
          region: configService.fileConfig.awsS3Region || 'ap-south-1',
          credentials:
            configService.fileConfig.accessKeyId &&
            configService.fileConfig.secretAccessKey
              ? {
                  accessKeyId: configService.fileConfig.accessKeyId,
                  secretAccessKey: configService.fileConfig.secretAccessKey,
                }
              : undefined,
        });

        return {
          fileFilter: (request, file, callback) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
              return callback(
                new UnprocessableEntityException({
                  status: HttpStatus.UNPROCESSABLE_ENTITY,
                  errors: {
                    file: `cantUploadFileType`,
                  },
                }),
                false,
              );
            }

            callback(null, true);
          },
          storage: multerS3({
            s3: s3,
            bucket: configService.fileConfig.awsDefaultS3Bucket || '',
            acl: 'public-read',
            contentType: (req, file, cb) => {
              cb(null, file.mimetype);
            },
            key: (request, file, callback) => {
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
  controllers: [FilesS3PresignedController],
  providers: [
    FilesS3PresignedService,
    {
      provide: FileRepository,
      useClass: FileRelationalRepository,
    },
  ],
  exports: [FilesS3PresignedService],
})
export class FilesS3PresignedModule {}
