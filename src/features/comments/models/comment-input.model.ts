import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';

export class CommentInputModel {
  @ApiProperty({ type: String, minLength: 20, maxLength: 300 })
  @Length(20, 300)
  content: string;
}
