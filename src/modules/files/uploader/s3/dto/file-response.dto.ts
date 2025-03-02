import { ApiProperty } from '@nestjs/swagger';
import { FileType } from 'src/modules/files/domain/file';

export class FileResponseDto {
  @ApiProperty({
    type: () => FileType,
  })
  file: FileType;
}
