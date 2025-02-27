import { Column, Entity, JoinColumn, OneToOne, type Relation } from 'typeorm';

import { ENTITY_NAME } from '../../constants/entity.constants';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';

@Entity({ name: ENTITY_NAME.USER_SETTINGS })
export class UserSettingsEntity extends BaseEntity {
  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: false })
  isPhoneVerified: boolean;

  @Column({ type: 'int' })
  userId: number;

  @OneToOne(() => UserEntity, (user) => user.settings, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: Relation<UserEntity>;
}
