import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BlogsRepository } from '../../../../infrastructure/blogs.repository';
import { ExceptionResultType } from '../../../../../../infrastructure/types/exceptions.types';
import { ResultCode } from '../../../../../../base/enums/result-code.enum';
import {
  blogIDField,
  blogNotFound,
} from '../../../../../../base/constants/constants';

export class BlogDeleteCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(BlogDeleteCommand)
export class BlogDeleteUseCase implements ICommandHandler<BlogDeleteCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(
    command: BlogDeleteCommand,
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

    await this.blogsRepository.deleteBlog(command.blogId);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
