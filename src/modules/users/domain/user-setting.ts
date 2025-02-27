import { ApiProperty } from '@nestjs/swagger';

export class UserSettings {
  @ApiProperty({
    type: 'number',
  })
  id: number;
  @ApiProperty({
    type: 'boolean',
  })
  isEmailVerified: boolean;
  @ApiProperty({
    type: 'boolean',
  })
  isPhoneVerified: boolean;
  @ApiProperty({
    type: 'number',
  })
  userId: number;
}
