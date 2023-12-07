import { Length } from 'class-validator';

export abstract class CommentInputDto {
  @Length(20, 300)
  content: string;
}
