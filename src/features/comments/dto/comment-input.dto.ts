import { Length } from 'class-validator';

export class CommentInputDTO {
  @Length(20, 300)
  content: string;
}
