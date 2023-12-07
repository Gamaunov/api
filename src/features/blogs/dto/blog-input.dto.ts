import { IsNotEmpty, IsUrl, MaxLength } from 'class-validator';

export class BlogInputDTO {
  @IsNotEmpty()
  @MaxLength(15)
  name: string;

  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @IsUrl()
  @MaxLength(100)
  websiteUrl: string;
}
