import { IsString, Length } from 'class-validator';
export class CreatePostDTO {
  @IsString()
  @Length(1, 30)
  title: string;

  @IsString()
  @Length(1, 30)
  shortDescription: string;

  @IsString()
  @Length(1, 1000)
  content: string;

  @IsString()
  blogId: string;
}
