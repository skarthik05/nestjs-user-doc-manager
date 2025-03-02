import { Injectable, NotFoundException } from '@nestjs/common';
import * as path from 'path';
import { ApiConfigService } from 'src/shared/services/api-config.service';

import { FileType } from '../../domain/file';
import { FileRepository } from '../../file.repository';

@Injectable()
export class FilesLocalService {
  constructor(
    private readonly configService: ApiConfigService,
    private readonly fileRepository: FileRepository,
  ) {}

  async create(file: Express.Multer.File): Promise<{ file: FileType }> {
    if (!file) {
      throw new NotFoundException('File not found');
    }

    const normalizedPath = path.posix.join(
      '/',
      this.configService.apiPrefix,
      'v1',
      file.path.split(path.sep).join('/'),
    );

    return {
      file: await this.fileRepository.create({
        path: normalizedPath,
      }),
    };
  }
}
