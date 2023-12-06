import { IsNotEmpty, IsUrl, MaxLength, NotContains } from 'class-validator';

export abstract class BlogInputDto {
  @IsNotEmpty()
  @NotContains(' ')
  @MaxLength(15)
  name: string;

  @IsNotEmpty()
  @NotContains(' ')
  @MaxLength(500)
  description: string;

  @IsUrl()
  @MaxLength(100)
  websiteUrl: string;
}
