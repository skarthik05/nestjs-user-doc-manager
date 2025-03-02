import { Allow } from 'class-validator';

import {
  ClassField,
  EmailField,
  NumberFieldOptional,
  PasswordField,
  PhoneFieldOptional,
  StringField,
} from '../../../decorators/field.decorators';
import { FileDto } from '../../../modules/files/dto/file.dto';

export class CreateUserDto {
  @StringField()
  readonly firstName!: string;

  @StringField()
  readonly lastName!: string;

  @EmailField()
  readonly email!: string;

  @PasswordField({ minLength: 6 })
  readonly password!: string;

  @PhoneFieldOptional()
  phone?: string;

  @NumberFieldOptional()
  roleId?: number | null;

  @Allow()
  salt?: string;

  @ClassField(() => FileDto)
  photo?: FileDto | null;
}
