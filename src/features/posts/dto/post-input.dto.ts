import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
export class PostInputDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  title: string;

  @IsString()
  @MaxLength(100)
  shortDescription: string;

  @IsNotEmpty()
  @MaxLength(1000)
  content: string;

  @IsString()
  @IsOptional()
  blogId?: string;
}
