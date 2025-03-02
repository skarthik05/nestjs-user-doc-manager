import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  HttpStatus,
  Injectable,
  NotFoundException,
  PayloadTooLargeException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { ApiConfigService } from 'src/shared/services/api-config.service';

import { FileType } from '../../domain/file';
import { FileRepository } from '../../file.repository';
import { FileUploadDto } from './dto/file.dto';

@Injectable()
export class FilesS3PresignedService {
  private s3: S3Client;

  constructor(
    private readonly fileRepository: FileRepository,
    private readonly configService: ApiConfigService,
  ) {
    this.s3 = new S3Client({
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
  }

  async create(
    file: FileUploadDto,
  ): Promise<{ file: FileType; uploadSignedUrl: string }> {
    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (!file.fileName.match(/\.(jpg|jpeg|png|gif)$/i)) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          file: `cantUploadFileType`,
        },
      });
    }

    if (file.fileSize > (this.configService.fileConfig.maxFileSize || 0)) {
      throw new PayloadTooLargeException({
        statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
        error: 'Payload Too Large',
        message: 'File too large',
      });
    }

    const key = `${randomStringGenerator()}.${file.fileName
      .split('.')
      .pop()
      ?.toLowerCase()}`;

    const command = new PutObjectCommand({
      Bucket: this.configService.fileConfig.awsDefaultS3Bucket,
      Key: key,
      ContentLength: file.fileSize,
      ContentType: file.fileType,
    });
    const signedUrl = await getSignedUrl(this.s3, command, {
      expiresIn: this.configService.fileConfig.expiresIn,
    });
    const filePath = `https://${this.configService.fileConfig.awsDefaultS3Bucket}.s3.${this.configService.fileConfig.awsS3Region}.amazonaws.com/${key}`;
    const data = await this.fileRepository.create({
      path: filePath,
      originalName: file.fileName,
      mimeType: command.input.ContentType,
      size: file.fileSize,
    });

    return {
      file: data,
      uploadSignedUrl: signedUrl,
    };
  }
}
