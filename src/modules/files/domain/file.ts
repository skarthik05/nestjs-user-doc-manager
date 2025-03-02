import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { Allow } from 'class-validator';

import { FileDriver } from '../../../common/types/file-config.type';
import { ENV_CONSTANTS } from '../../../constants/env.constants';

export class FileType {
  @ApiProperty({
    type: Number,
    example: 1,
  })
  @Allow()
  id: number;

  @ApiProperty({
    type: String,
    example: 'https://example.com/path/to/file.jpg',
  })
  @Transform(
    ({ value }: TransformFnParams): Promise<string> | string => {
      if (process.env[ENV_CONSTANTS.FILE_DRIVER] === FileDriver.LOCAL) {
        return (
          (process.env[ENV_CONSTANTS.BACKEND_DOMAIN] ??
            `http://localhost:${process.env[ENV_CONSTANTS.APP_PORT]}`) + value
        );
      } else if (
        [FileDriver.S3_PRESIGNED, FileDriver.S3].includes(
          process.env[ENV_CONSTANTS.FILE_DRIVER] as FileDriver,
        )
      ) {
        const s3 = new S3Client({
          region:
            (process.env[ENV_CONSTANTS.S3_REGION] as string) || 'ap-south-1',
          credentials:
            process.env[ENV_CONSTANTS.S3_ACCESS_KEY_ID] &&
            process.env[ENV_CONSTANTS.S3_SECRET_ACCESS_KEY]
              ? {
                  accessKeyId: process.env[ENV_CONSTANTS.S3_ACCESS_KEY_ID],
                  secretAccessKey:
                    process.env[ENV_CONSTANTS.S3_SECRET_ACCESS_KEY],
                }
              : undefined,
        });

        const command = new GetObjectCommand({
          Bucket:
            (process.env[ENV_CONSTANTS.S3_DEFAULT_BUCKET] as string) || '',
          Key: value as string,
        });

        return getSignedUrl(s3, command, {
          expiresIn: Number(
            process.env[ENV_CONSTANTS.S3_SIGNED_URL_EXPIRATION] ?? 3600,
          ),
        });
      }

      return value as string;
    },
    {
      toPlainOnly: true,
    },
  )
  path: string;

  @ApiProperty({
    type: String,
    example: 'file.jpg',
  })
  originalName: string;

  @ApiProperty({
    type: String,
    example: 'image/jpeg',
  })
  mimeType: string;

  @ApiProperty({
    type: Number,
    example: 1024,
  })
  size: number;
}
