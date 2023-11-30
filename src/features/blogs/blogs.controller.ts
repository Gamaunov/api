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

import { PostsService } from '../posts/posts.service';
import { PostsQueryRepository } from '../posts/posts.query.repository';
import { PostInputDTO } from '../posts/dto/post-input.dto';
import { PostQuery } from '../posts/dto/post.query';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { UserIdFromHeaders } from '../auth/decorators/user-id-from-headers.param.decorator';
import { Paginator } from '../../shared/genericTypes/paginator';
import { exceptionHandler } from '../../shared/exceptions/exception.handler';
import { ResultCode } from '../../shared/enums/result-code.enum';
import { blogIDField, blogNotFound } from '../../shared/constants/constants';
import { PostView } from '../posts/schemas/post.view';

import { BlogInputDTO } from './dto/blog-input.dto';
import { BlogQuery } from './dto/blog-query';
import { BlogsService } from './blogs.service';
import { BlogsQueryRepository } from './blogs.query.repository';
import { BlogView } from './schemas/blog.view';
import { Blog } from './schemas/blog.entity';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  async findBlogs(@Query() query: BlogQuery): Promise<Paginator<BlogView[]>> {
    return this.blogsQueryRepository.findBlogs(query);
  }

  @Get(':id')
  async findBlogById(@Param('id') id: string) {
    const blog: BlogView | null = await this.blogsQueryRepository.findBlogById(
      id,
    );

    if (!blog) {
      return exceptionHandler(ResultCode.NotFound, blogNotFound, blogIDField);
    }

    return blog;
  }

  @Get('/:id/posts')
  async findPosts(
    @UserIdFromHeaders() userId: string,
    @Param('id') blogId: string,
    @Query() query: PostQuery,
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

  @UseGuards(BasicAuthGuard)
  @Post()
  async createBlog(@Body() blogInputDTO: BlogInputDTO): Promise<BlogView> {
    const blogId: string = await this.blogsService.createBlog(blogInputDTO);
    return this.blogsQueryRepository.findBlogById(blogId);
  }
  @UseGuards(BasicAuthGuard)
  @Post('/:id/posts')
  async createPost(
    @Param('id') id: string,
    @Body() createPostDTO: PostInputDTO,
  ): Promise<PostView | void> {
    const postId: string = await this.postsService.createPost(
      createPostDTO,
      id,
    );

    if (!postId) {
      return exceptionHandler(ResultCode.NotFound, blogNotFound, blogIDField);
    }

    return this.postsQueryRepository.findPostById(postId);
  }
  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(204)
  async updateBlog(
    @Param('id') id: string,
    @Body() blogInputDTO: BlogInputDTO,
  ): Promise<Blog | void> {
    const result: Blog = await this.blogsService.updateBlog(id, blogInputDTO);

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, blogNotFound, blogIDField);
    }

    return result;
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async deleteBlog(@Param('id') id: string): Promise<boolean | void> {
    const result: boolean = await this.blogsService.deleteBlog(id);

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, blogNotFound, blogIDField);
    }

    return result;
  }

  @Delete()
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async deleteAllBlogs(): Promise<boolean> {
    return this.blogsService.deleteAllBlogs();
  }
}
