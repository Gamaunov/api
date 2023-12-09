import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BlogInputModel } from '../../../../models/blog-input.model';
import { BlogsRepository } from '../../../../infrastructure/blogs.repository';
import { ExceptionResultType } from '../../../../../../infrastructure/types/exceptions.types';
import { ResultCode } from '../../../../../../base/enums/result-code.enum';
import {
  blogIDField,
  blogNotFound,
} from '../../../../../../base/constants/constants';

export class BlogUpdateCommand {
  constructor(
    public blogInputDTO: BlogInputModel,
    public blogId: string,
    public userId: string,
  ) {}
}

@CommandHandler(BlogUpdateCommand)
export class BlogUpdateUseCase implements ICommandHandler<BlogUpdateCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(
    command: BlogUpdateCommand,
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

    await blog.updateBlog(command.blogInputDTO);
    await this.blogsRepository.save(blog);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
