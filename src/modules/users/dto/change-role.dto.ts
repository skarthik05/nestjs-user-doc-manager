import { NumberField } from '../../../decorators/field.decorators';

export class ChangeRoleDto {
  @NumberField()
  roleId: number;
}
