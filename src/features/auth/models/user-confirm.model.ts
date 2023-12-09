import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { Trim } from '../../../infrastructure/decorators/trim.decorator';

export class ConfirmCodeInputModel {
  @ApiProperty({ type: String })
  @IsString()
  @Trim()
  @IsNotEmpty()
  code: string;
}
