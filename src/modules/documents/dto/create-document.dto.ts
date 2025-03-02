import {
  NumberField,
  StringField,
  StringFieldOptional,
} from '../../../decorators/field.decorators';

export class CreateDocumentDto {
  @StringField()
  title: string;

  @StringFieldOptional()
  description?: string;

  @NumberField()
  fileId: number;
}
