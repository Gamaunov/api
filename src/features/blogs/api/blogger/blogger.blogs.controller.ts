import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { BlogsQueryRepository } from '../../infrastructure/blogs.query.repository';
import { BlogInputDTO } from '../../dto/blog-input.dto';
import { UserIdFromGuard } from '../../../auth/decorators/user-id-from-guard.param.decorator';
import { exceptionHandler } from '../../../../shared/exceptions/exception.handler';
import { ResultCode } from '../../../../shared/enums/result-code.enum';
import {
  userIDField,
  userNotFound,
} from '../../../../shared/constants/constants';
import { BlogQuery } from '../../dto/blog-query';
import { PostInputDTO } from '../../../posts/dto/post-input.dto';
import { PostsQueryRepository } from '../../../posts/infrastructure/posts.query.repository';
import { PostCreateCommand } from '../../../posts/api/blogger/application/use-cases/post-create.use-case';
import { BasicAuthGuard } from '../../../auth/guards/basic-auth.guard';

import { BlogUpdateCommand } from './application/use-cases/blog-update.use-case';
import { BlogDeleteCommand } from './application/use-cases/blog-delete.use-case';
import { BlogCreateCommand } from './application/use-cases/blog-create.use-case';

@Controller('blogs')
export class BloggerBlogsController {
  constructor(
    private commandBus: CommandBus,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  async findBlogs(@Query() query: BlogQuery) {
    return this.blogsQueryRepository.findBlogs(query);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createBlog(@Body() blogInputDTO: BlogInputDTO) {
    const blogId = await this.commandBus.execute(
      new BlogCreateCommand(blogInputDTO),
    );

    if (!blogId) {
      return exceptionHandler(ResultCode.NotFound, userNotFound, userIDField);
    }

    return this.blogsQueryRepository.findBlogById(blogId);
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(204)
  async updateBlog(
    @Body() blogInputDTO: BlogInputDTO,
    @Param('id') blogId,
    @UserIdFromGuard() userId,
  ) {
    const result = await this.commandBus.execute(
      new BlogUpdateCommand(blogInputDTO, blogId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  @Post(':id/posts')
  async createPost(
    @Body() postInputDto: PostInputDTO,
    @Param('id') blogId,
    @UserIdFromGuard() userId,
  ) {
    const result = await this.commandBus.execute(
      new PostCreateCommand(postInputDto, blogId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return this.postsQueryRepository.findPost(result.response);
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteBlog(@Param('id') blogId, @UserIdFromGuard() userId) {
    const result = await this.commandBus.execute(
      new BlogDeleteCommand(blogId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }
}
