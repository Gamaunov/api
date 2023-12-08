import { IsBlogExist } from '../../../shared/exceptions/decorators/is-blog-exist.decorator';

import { PostInputDTO } from './post-input.dto';

export class CreatePostInputDto extends PostInputDTO {
  @IsBlogExist({
    message: 'blog not found',
  })
  blogId: string;
}
