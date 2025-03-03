import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { ENTITY_NAME } from '../../constants/entity.constants';
import { BaseEntity } from './base.entity';
import { DocumentEntity } from './document.entity';
import { UserEntity } from './user.entity';

export enum IngestionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity({
  name: ENTITY_NAME.INGESTION,
})
export class IngestionEntity extends BaseEntity {
  @Column({
    type: 'enum',
    enum: IngestionStatus,
    default: IngestionStatus.PENDING,
  })
  status: IngestionStatus;

  @Column({ nullable: true })
  error?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @ManyToOne(() => UserEntity, {
    eager: true,
  })
  @JoinColumn({ name: 'triggered_by_id' })
  triggeredBy: UserEntity;

  @ManyToOne(() => DocumentEntity, { eager: true })
  @JoinColumn({ name: 'document_id' })
  document: DocumentEntity;

  @Column({ name: 'document_id' })
  documentId: number;

  @Column({ name: 'triggered_by_id' })
  triggeredById: number;
}
