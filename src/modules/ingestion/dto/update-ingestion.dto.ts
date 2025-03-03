import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { IngestionStatus } from '../domain/ingestion';

export class UpdateIngestionDto {
  @ApiProperty({
    enum: IngestionStatus,
    description: 'Status of the ingestion',
  })
  @IsEnum(IngestionStatus)
  status: IngestionStatus;

  @ApiProperty({
    description: 'Error message if ingestion failed',
    required: false,
  })
  @IsString()
  @IsOptional()
  error?: string;
}
