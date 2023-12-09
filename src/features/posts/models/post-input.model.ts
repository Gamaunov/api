import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { IsNotEmptyString } from '../../../infrastructure/decorators/is-not-empty-string.decorator';

export class PostInputModel {
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
}
