import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { BlogsQueryRepository } from '../../infrastructure/blogs.query.repository';
import { exceptionHandler } from '../../../../infrastructure/exception-filters/exception.handler';
import { ResultCode } from '../../../../base/enums/result-code.enum';
import {
  blogIDField,
  blogNotFound,
} from '../../../../base/constants/constants';
import { QueryModel } from '../../../../base/models/query.model';
import { PostsQueryRepository } from '../../../posts/infrastructure/posts.query.repository';
import { UserIdFromHeaders } from '../../../auth/decorators/user-id-from-headers.decorator';

@ApiTags('blogs')
@Controller('blogs')
export class PublicBlogsController {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Returns blog by id' })
  async findBlog(@Param('id') id: string) {
    const result = await this.blogsQueryRepository.findBlogById(id);

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, blogNotFound, blogIDField);
    }

    return result;
  }

  @Get(':id/posts-likes')
  @ApiOperation({ summary: 'Returns all posts-likes for specified blog' })
  async findPosts(
    @Query() query: QueryModel,
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
