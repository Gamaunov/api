import { IsBlogExist } from '../../../infrastructure/decorators/is-blog-exist.decorator';

import { PostInputModel } from './post-input.model';

export class CreatePostInputModel extends PostInputModel {
  @IsBlogExist({
    message: 'blog not found',
  })
  blogId: string;
}
