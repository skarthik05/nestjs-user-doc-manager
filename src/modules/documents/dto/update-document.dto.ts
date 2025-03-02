import { PartialType } from '@nestjs/mapped-types';

import {
  NumberFieldOptional,
  StringFieldOptional,
} from '../../../decorators/field.decorators';
import { CreateDocumentDto } from './create-document.dto';

export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {
  @NumberFieldOptional()
  fileId?: number;
  @StringFieldOptional()
  title?: string;
  @StringFieldOptional()
  description?: string;
}
