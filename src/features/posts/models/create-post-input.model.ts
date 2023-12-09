import { ApiProperty } from '@nestjs/swagger';

import { IsBlogExist } from '../../../infrastructure/decorators/is-blog-exist.decorator';

import { PostInputModel } from './post-input.model';

export class CreatePostInputModel extends PostInputModel {
  @ApiProperty({ type: String })
  @IsBlogExist({
    message: 'blog not found',
  })
  blogId: string;
}
