import { Controller, Get, Param, Query } from '@nestjs/common';

import { BlogsQueryRepository } from '../../infrastructure/blogs.query.repository';
import { exceptionHandler } from '../../../../shared/exceptions/exception.handler';
import { ResultCode } from '../../../../shared/enums/result-code.enum';
import {
  blogIDField,
  blogNotFound,
} from '../../../../shared/constants/constants';
import { QueryDTO } from '../../../../shared/dto/query.dto';
import { PostsQueryRepository } from '../../../posts/infrastructure/posts.query.repository';
import { UserIdFromHeaders } from '../../../auth/decorators/user-id-from-headers.decorator';

@Controller('blogs')
export class PublicBlogsController {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get(':id')
  async findBlog(@Param('id') id: string) {
    const result = await this.blogsQueryRepository.findBlogById(id);

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, blogNotFound, blogIDField);
    }

    return result;
  }

  @Get(':id/posts')
  async findPosts(
    @Query() query: QueryDTO,
    @Param('id') blogId: string,
    @UserIdFromHeaders() userId: string,
  ) {
    const result = await this.postsQueryRepository.findPosts(
      query,
      userId,
      blogId,
    );

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, blogNotFound, blogIDField);
    }

    return result;
  }
}
