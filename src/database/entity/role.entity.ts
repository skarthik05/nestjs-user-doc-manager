import { Column, Entity } from 'typeorm';

import { ENTITY_NAME } from '../../constants/entity.constants';
import { BaseEntity } from './base.entity';

@Entity({
  name: ENTITY_NAME.ROLE,
})
export class RoleEntity extends BaseEntity {
  @Column()
  name?: string;

  @Column()
  description?: string;

  @Column()
  isActive?: boolean;

  @Column()
  isDefault?: boolean;
}
