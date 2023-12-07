import {
  IsNotEmpty,
  IsUrl,
  Matches,
  MaxLength,
  NotContains,
} from 'class-validator';

export class BlogInputDTO {
  @IsNotEmpty()
  @NotContains(' ')
  @Matches(/^[a-zA-Z]+$/)
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
