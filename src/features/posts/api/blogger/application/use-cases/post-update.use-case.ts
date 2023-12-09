import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BlogsRepository } from '../../../../../blogs/infrastructure/blogs.repository';
import { PostInputModel } from '../../../../models/post-input.model';
import { ExceptionResultType } from '../../../../../../infrastructure/types/exceptions.types';
import { ResultCode } from '../../../../../../base/enums/result-code.enum';
import {
  blogIDField,
  blogNotFound,
  postIDField,
  postNotFound,
} from '../../../../../../base/constants/constants';
import { PostsRepository } from '../../../../infrastructure/posts.repository';

export class PostUpdateCommand {
  constructor(
    public postInputModel: PostInputModel,
    public blogId: string,
    public postId: string,
    public userId: string,
  ) {}
}

@CommandHandler(PostUpdateCommand)
export class PostUpdateUseCase implements ICommandHandler<PostUpdateCommand> {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
  ) {}

  async execute(
    command: PostUpdateCommand,
  ): Promise<ExceptionResultType<boolean>> {
    const blog = await this.blogsRepository.findBlogById(command.blogId);

    if (!blog) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: blogIDField,
        message: blogNotFound,
      };
    }

    const post = await this.postsRepository.findPostById(command.postId);

    if (!post) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: postIDField,
        message: postNotFound,
      };
    }

    post.updatePost(command.postInputModel);
    await this.postsRepository.save(post);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
