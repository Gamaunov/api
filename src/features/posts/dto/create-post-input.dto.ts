import { IsNotEmpty, IsString } from 'class-validator';

import { PostInputDTO } from './post-input.dto';

export class CreatePostInputDto extends PostInputDTO {
  @IsString()
  @IsNotEmpty()
  blogId: string;
}
