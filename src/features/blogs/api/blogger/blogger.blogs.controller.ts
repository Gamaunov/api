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
import { ApiBasicAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { BlogsQueryRepository } from '../../infrastructure/blogs.query.repository';
import { BlogInputModel } from '../../models/blog-input.model';
import { UserIdFromGuard } from '../../../auth/decorators/user-id-from-guard.guard.decorator';
import { exceptionHandler } from '../../../../infrastructure/exception-filters/exception.handler';
import { ResultCode } from '../../../../base/enums/result-code.enum';
import { BlogQueryModel } from '../../models/blog-quer.model';
import { PostInputModel } from '../../../posts/models/post-input.model';
import { PostsQueryRepository } from '../../../posts/infrastructure/posts.query.repository';
import { PostCreateCommand } from '../../../posts/api/blogger/application/use-cases/post-create.use-case';
import { BasicAuthGuard } from '../../../auth/guards/basic-auth.guard';
import { Blog, BlogModelType } from '../../domain/blog.entity';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

import { BlogUpdateCommand } from './application/use-cases/blog-update.use-case';
import { BlogDeleteCommand } from './application/use-cases/blog-delete.use-case';

@ApiTags('blogs')
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
  @ApiOperation({ summary: 'Returns blogs with paging' })
  async findBlogs(@Query() query: BlogQueryModel) {
    return this.blogsQueryRepository.findBlogs(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create new blog. Admins only' })
  @ApiBasicAuth('Basic')
  @UseGuards(BasicAuthGuard)
  @HttpCode(201)
  async createBlog(@Body() blogInputModel: BlogInputModel) {
    const blog = this.BlogModel.createBlog(this.BlogModel, blogInputModel);
    await this.blogsRepository.save(blog);
    return this.blogsRepository.findBlog(blog._id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update existing Blog by id with InputModel. Admins only',
  })
  @ApiBasicAuth('Basic')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async updateBlog(
    @Body() blogInputModel: BlogInputModel,
    @Param('id') blogId: string,
    @UserIdFromGuard() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new BlogUpdateCommand(blogInputModel, blogId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  @Post(':id/posts')
  @ApiOperation({ summary: 'Create new post for specific blog. Admins only' })
  @ApiBasicAuth('Basic')
  @UseGuards(BasicAuthGuard)
  async createPost(
    @Body() postInputModel: PostInputModel,
    @Param('id') blogId: string,
  ) {
    const result = await this.commandBus.execute(
      new PostCreateCommand(postInputModel, blogId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return this.postsQueryRepository.findPostById(result.response);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete blog specified by id. Admins only',
  })
  @ApiBasicAuth('Basic')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async deleteBlog(
    @Param('id') blogId: string,
    @UserIdFromGuard() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new BlogDeleteCommand(blogId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }
}
