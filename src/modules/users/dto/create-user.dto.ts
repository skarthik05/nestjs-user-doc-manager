import { Allow } from 'class-validator';

import {
  EmailField,
  NumberFieldOptional,
  PasswordField,
  PhoneFieldOptional,
  StringField,
} from '../../../decorators/field.decorators';

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

  @NumberFieldOptional()
  photoId?: number | null;
}
