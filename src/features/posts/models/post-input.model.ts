import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { IsNotEmptyString } from '../../../infrastructure/decorators/is-not-empty-string.decorator';

export class PostInputModel {
  @ApiProperty({ type: String, maxLength: 30 })
  @IsString()
  @IsNotEmpty()
  @IsNotEmptyString()
  @MaxLength(30)
  title: string;

  @ApiProperty({ type: String, maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @IsNotEmptyString()
  @MaxLength(100)
  shortDescription: string;

  @ApiProperty({ type: String, maxLength: 1000 })
  @IsString()
  @IsNotEmpty()
  @IsNotEmptyString()
  @MaxLength(1000)
  content: string;
}
