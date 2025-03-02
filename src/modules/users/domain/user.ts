import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

import { FileType } from '../../files/domain/file';
import { Role } from '../../roles/domain/role';
import { UserSettings } from './user-setting';

export class User {
  @ApiProperty({
    type: 'number',
  })
  id: number;

  @ApiProperty({
    type: String,
    example: 'john.doe@example.com',
  })
  @Expose({ groups: ['me', 'admin'] })
  email: string | null;

  @Exclude({ toPlainOnly: true })
  password?: string;

  @Exclude({ toPlainOnly: true })
  salt?: string;

  @ApiProperty({
    type: String,
    example: 'John',
  })
  firstName: string | null;

  @ApiProperty({
    type: String,
    example: 'Doe',
  })
  lastName: string | null;

  @ApiProperty({
    type: () => Role,
  })
  role?: Role | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt: Date;

  @ApiProperty()
  settings?: UserSettings | null;
  @ApiProperty({
    type: () => FileType,
  })
  photo?: FileType | null;
}
