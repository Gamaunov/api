import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BlogsRepository } from '../../../../../blogs/infrastructure/blogs.repository';
import { PostInputDto } from '../../../../dto/post-input.dto';
import { ExceptionResultType } from '../../../../../../shared/types/exceptions.types';
import { ResultCode } from '../../../../../../shared/enums/result-code.enum';
import {
  blogIDField,
  blogNotFound,
  postIDField,
  postNotFound,
} from '../../../../../../shared/constants/constants';
import { PostsRepository } from '../../../../infrastructure/posts.repository';

export class PostUpdateCommand {
  constructor(
    public postInputDto: PostInputDto,
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

    post.updatePost(command.postInputDto);
    await this.postsRepository.save(post);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
