import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';

import { IsNotEmptyString } from '../../../infrastructure/decorators/is-not-empty-string.decorator';

export class BlogInputModel {
  @ApiProperty({ type: String, maxLength: 15 })
  @IsString()
  @IsNotEmpty()
  @IsNotEmptyString()
  @MaxLength(15)
  name: string;

  @ApiProperty({ type: String, maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @IsNotEmptyString()
  @MaxLength(500)
  description: string;

  @ApiProperty({ type: String, format: 'url', maxLength: 100 })
  @IsUrl()
  @MaxLength(100)
  websiteUrl: string;
}
