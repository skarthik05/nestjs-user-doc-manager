import { Column, Entity } from 'typeorm';

import { ENTITY_NAME } from '../../constants/entity.constants';
import { BaseEntity } from './base.entity';

@Entity({ name: ENTITY_NAME.FILE })
export class FileEntity extends BaseEntity {
  @Column()
  path: string;
}
