import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';

export class NewPasswordModel {
  @ApiProperty({ type: String, minLength: 6, maxLength: 20 })
  @Length(6, 20)
  newPassword: string;

  @ApiProperty()
  recoveryCode: string;
}
