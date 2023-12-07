import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';

import { IsNotEmptyString } from '../../../shared/exceptions/decorators/is-not-empty-string.decorator';

export class BlogInputDTO {
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
