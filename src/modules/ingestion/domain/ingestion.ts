import {
  ClassField,
  DateField,
  EnumField,
  NumberField,
  StringField,
} from '../../../decorators/field.decorators';
import { Document } from '../../documents/domain/document';
import { User } from '../../users/domain/user';

export enum IngestionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  ABORT = 'ABORT',
}

export class Ingestion {
  @NumberField()
  id: number;

  @EnumField(() => IngestionStatus)
  status: IngestionStatus;

  @StringField({ nullable: true })
  error?: string;

  @ClassField(() => Object, { nullable: true })
  metadata?: Record<string, unknown>;

  @ClassField(() => User)
  triggeredBy: User;

  @ClassField(() => Document)
  document: Document;

  @DateField()
  createdAt: Date;

  @DateField()
  updatedAt: Date;
}
