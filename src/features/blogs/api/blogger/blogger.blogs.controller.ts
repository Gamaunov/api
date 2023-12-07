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
import { InjectModel } from '@nestjs/mongoose';

import { BlogsQueryRepository } from '../../infrastructure/blogs.query.repository';
import { BlogInputDTO } from '../../dto/blog-input.dto';
import { UserIdFromGuard } from '../../../auth/decorators/user-id-from-guard.guard.decorator';
import { exceptionHandler } from '../../../../shared/exceptions/exception.handler';
import { ResultCode } from '../../../../shared/enums/result-code.enum';
import { BlogQuery } from '../../dto/blog-query';
import { PostInputDTO } from '../../../posts/dto/post-input.dto';
import { PostsQueryRepository } from '../../../posts/infrastructure/posts.query.repository';
import { PostCreateCommand } from '../../../posts/api/blogger/application/use-cases/post-create.use-case';
import { BasicAuthGuard } from '../../../auth/guards/basic-auth.guard';
import { Blog, BlogModelType } from '../../blog.entity';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

import { BlogUpdateCommand } from './application/use-cases/blog-update.use-case';
import { BlogDeleteCommand } from './application/use-cases/blog-delete.use-case';

@Controller('blogs')
export class BloggerBlogsController {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    private readonly blogsRepository: BlogsRepository,
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
  @HttpCode(201)
  async createBlog(@Body() blogInputDTO: BlogInputDTO) {
    const blog = this.BlogModel.createBlog(this.BlogModel, blogInputDTO);
    await this.blogsRepository.save(blog);
    return this.blogsRepository.findBlog(blog._id);
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(204)
  async updateBlog(
    @Body() blogInputDTO: BlogInputDTO,
    @Param('id') blogId: string,
    @UserIdFromGuard() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new BlogUpdateCommand(blogInputDTO, blogId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  @UseGuards(BasicAuthGuard)
  @Post(':id/posts')
  async createPost(
    @Body() postInputDTO: PostInputDTO,
    @Param('id') blogId: string,
  ) {
    const result = await this.commandBus.execute(
      new PostCreateCommand(postInputDTO, blogId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return this.postsQueryRepository.findPostById(result.response);
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
