import { IsNotEmpty, IsString, Length, MaxLength } from 'class-validator';
export class PostInputDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @Length(1, 30)
  shortDescription: string;

  @IsNotEmpty()
  @MaxLength(100)
  content: string;
}
