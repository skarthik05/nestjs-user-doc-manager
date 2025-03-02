import { type NullableType } from '../../common/types/nullable.type';
import { type FileEntity } from '../../database/entity/file.entity';

export abstract class FileRepository {
  abstract findById(id: number): Promise<NullableType<FileEntity>>;
  abstract findByIds(ids: number[]): Promise<FileEntity[]>;
  abstract create(data: Partial<FileEntity>): Promise<FileEntity>;
  abstract remove(id: number): Promise<void>;
}
