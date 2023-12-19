import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class NewPasswordModel {
  @ApiProperty({ type: String, minLength: 6, maxLength: 20 })
  @Length(6, 20)
  newPassword: string;

  @ApiProperty()
  @IsString()
  recoveryCode: string;
}
