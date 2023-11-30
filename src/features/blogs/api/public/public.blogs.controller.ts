import { Controller, Get, Param, Query } from '@nestjs/common';

import { BlogsQueryRepository } from '../../infrastructure/blogs.query.repository';
import { BlogQuery } from '../../dto/blog-query';
import { Role } from '../../../../shared/enums/roles.enum';
import { exceptionHandler } from '../../../../shared/exceptions/exception.handler';
import { ResultCode } from '../../../../shared/enums/result-code.enum';
import {
  blogIDField,
  blogNotFound,
} from '../../../../shared/constants/constants';
import { QueryDTO } from '../../../../shared/dto/query.dto';
import { PostsQueryRepository } from '../../../posts/infrastructure/posts.query.repository';
import { UserIdFromGuard } from '../../../auth/decorators/user-id-from-guard.param.decorator';

@Controller('blogs')
export class PublicBlogsController {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  async findBlogs(@Query() query: BlogQuery) {
    const role = Role.USER;
    return this.blogsQueryRepository.findBlogs(query, role);
  }

  @Get(':id')
  async findBlog(@Param('id') id) {
    const result = await this.blogsQueryRepository.findBlogById(id);

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, blogNotFound, blogIDField);
    }

    return result;
  }

  @Get(':id/posts')
  async findPosts(
    @Query() query: QueryDTO,
    @Param('id') blogId,
    @UserIdFromGuard() userId,
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
