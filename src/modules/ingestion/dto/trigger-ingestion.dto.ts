import { NumberField } from '../../../decorators/field.decorators';

export class TriggerIngestionDto {
  @NumberField()
  documentId: number;
}
