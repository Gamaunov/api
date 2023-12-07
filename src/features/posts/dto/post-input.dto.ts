import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

import { IsNotEmptyString } from '../../../shared/exceptions/decorators/is-not-empty-string.decorator';
export class PostInputDTO {
  @IsString()
  @IsNotEmpty()
  @IsNotEmptyString()
  @MaxLength(30)
  title: string;

  @IsString()
  @IsNotEmpty()
  @IsNotEmptyString()
  @MaxLength(100)
  shortDescription: string;

  @IsString()
  @IsNotEmpty()
  @IsNotEmptyString()
  @MaxLength(1000)
  content: string;

  @IsString()
  @IsOptional()
  blogId?: string;
}
