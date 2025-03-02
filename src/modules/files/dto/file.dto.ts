import { NumberField, StringField } from '../../../decorators/field.decorators';

export class FileDto {
  @NumberField()
  id: number;

  @StringField()
  path: string;
}
