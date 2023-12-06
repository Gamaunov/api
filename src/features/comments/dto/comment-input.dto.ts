import { Length } from 'class-validator';

export abstract class CommentInputDTO {
  @Length(20, 300)
  content: string;
}
