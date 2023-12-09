import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';

import { IsNotEmptyString } from '../../../infrastructure/decorators/is-not-empty-string.decorator';

export class BlogInputModel {
  @IsString()
  @IsNotEmpty()
  @IsNotEmptyString()
  @MaxLength(15)
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsNotEmptyString()
  @MaxLength(500)
  description: string;

  @IsUrl()
  @MaxLength(100)
  websiteUrl: string;
}
