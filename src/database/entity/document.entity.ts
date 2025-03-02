import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

import { ENTITY_NAME } from '../../constants/entity.constants';
import { BaseEntity } from './base.entity';
import { FileEntity } from './file.entity';
import { UserEntity } from './user.entity';

@Entity(ENTITY_NAME.DOCUMENT)
export class DocumentEntity extends BaseEntity {
  @ApiProperty({ example: 'Project Requirements' })
  @Column()
  title: string;

  @ApiProperty({ example: 'Project scope and requirements documentation' })
  @Column({ nullable: true })
  description?: string;

  @OneToOne(() => FileEntity, { cascade: true, nullable: true })
  @JoinColumn({ name: 'file_id' })
  file: FileEntity | null;

  @Column({ name: 'file_id', unique: true, nullable: true })
  fileId: number | null;

  @ManyToOne(() => UserEntity, (user) => user.id)
  @JoinColumn({ name: 'uploaded_by_id' })
  uploadedBy: UserEntity;
}
