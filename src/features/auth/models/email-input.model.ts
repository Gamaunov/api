import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class EmailInputModel {
  @ApiProperty({ type: String, format: 'email' })
  @IsEmail()
  email: string;
}
