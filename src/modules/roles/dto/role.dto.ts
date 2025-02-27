import {
  BooleanField,
  NumberField,
  StringField,
} from '../../../decorators/field.decorators';

export class RoleDto {
  @NumberField({ int: true })
  id: number;

  @StringField()
  name: string;

  @StringField()
  description: string;

  @BooleanField()
  isActive: boolean;

  @BooleanField()
  isDefault: boolean;
}
