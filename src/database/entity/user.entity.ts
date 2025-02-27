import { Column, Entity, Index, ManyToOne, OneToOne } from 'typeorm';

import { ENTITY_NAME } from '../../constants/entity.constants';
import { BaseEntity } from './base.entity';
import { RoleEntity } from './role.entity';
import { UserSettingsEntity } from './user-settings.entity';

@Entity({
  name: ENTITY_NAME.USER,
})
export class UserEntity extends BaseEntity {
  @Column({ type: String, unique: true, nullable: true })
  email: string | null;

  @Column({ nullable: true })
  password?: string;

  @Column({ type: String, nullable: true })
  salt?: string;

  @Column({ type: String, nullable: true })
  phone?: string;

  @Index()
  @Column({ type: String, nullable: true })
  firstName: string | null;

  @Index()
  @Column({ type: String, nullable: true })
  lastName: string | null;

  @ManyToOne(() => RoleEntity, {
    eager: true,
  })
  role?: RoleEntity | null;

  @OneToOne(() => UserSettingsEntity, (settings) => settings.user, {
    cascade: true,
  })
  settings?: UserSettingsEntity;
}
