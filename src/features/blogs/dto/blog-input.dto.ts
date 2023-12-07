import {
  IsAlpha,
  IsNotEmpty,
  IsUrl,
  MaxLength,
  NotContains,
} from 'class-validator';

export class BlogInputDTO {
  @IsNotEmpty()
  @NotContains(' ')
  @IsAlpha()
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
