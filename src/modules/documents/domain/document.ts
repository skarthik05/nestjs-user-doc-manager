import {
  ClassField,
  DateField,
  NumberField,
  StringField,
} from '../../../decorators/field.decorators';
import { FileType } from '../../files/domain/file';
import { User } from '../../users/domain/user';

export class Document {
  @NumberField()
  id: number;

  @StringField()
  title: string;

  @StringField({ nullable: true })
  description?: string;

  @ClassField(() => FileType)
  file: FileType;

  @ClassField(() => User)
  uploadedBy: User;

  @DateField()
  createdAt: Date;

  @DateField()
  updatedAt: Date;
}
