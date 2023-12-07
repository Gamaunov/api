import { IsNotEmpty, IsUrl, Matches, MaxLength } from 'class-validator';

export class BlogInputDTO {
  @IsNotEmpty()
  @Matches(/^[a-zA-Z]+$/)
  @MaxLength(15)
  name: string;

  @IsNotEmpty()
  @Matches(/^[a-zA-Z]+$/)
  @MaxLength(500)
  description: string;

  @IsUrl()
  @MaxLength(100)
  websiteUrl: string;
}
