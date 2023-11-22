import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { PostsService } from '../posts/posts.service';
import { PostsQueryRepository } from '../posts/posts.query.repository';
import { CreatePostDTO } from '../posts/dto/create-post.dto';
import { PostQuery } from '../posts/dto/post.query';
import { PostView } from '../posts/schemas/post.view';
import { Paginator } from '../../shared/genericTypes/paginator';
import { UserIdDecorator } from '../../shared/decorators/user-id.decorator';

import { CreateBlogDTO } from './dto/create-blog.dto';
import { BlogQuery } from './dto/blog-query';
import { UpdateBlogDTO } from './dto/update-blog.dto';
import { BlogsService } from './blogs.service';
import { BlogsQueryRepository } from './blogs.query.repository';
import { Blog } from './schemas/blog.entity';
import { BlogView } from './schemas/blog.view';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  async findBlogs(
    @Query() query: BlogQuery,
  ): Promise<Paginator<BlogView[] | null>> {
    return this.blogsQueryRepository.findBlogs(query);
  }

  @Get(':id')
  async findBlog(@Param('id') id: string): Promise<BlogView> {
    const blog: BlogView | null = await this.blogsQueryRepository.findBlog(id);

    if (!blog) {
      throw new NotFoundException();
    }

    return blog;
  }

  @Get('/:id/posts')
  async findPosts(
    @UserIdDecorator() userId: string,
    @Param('id') blogId: string,
    @Query() query: PostQuery,
  ): Promise<Paginator<PostView[] | null>> {
    const result = await this.postsQueryRepository.findPosts(
      query,
      userId,
      blogId,
    );

    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }

  @Post()
  async createBlog(@Body() createBlogDTO: CreateBlogDTO): Promise<BlogView> {
    return this.blogsService.createBlog(createBlogDTO);
  }

  @Post('/:id/posts')
  async createPost(
    @Param('id') id: string,
    @Body() createPostDTO: CreatePostDTO,
  ): Promise<PostView> {
    return this.postsService.createPost(createPostDTO, id);
  }

  @Put(':id')
  @HttpCode(204)
  async updateBlog(
    @Param('id') id: string,
    @Body() updateBlogDTO: UpdateBlogDTO,
  ): Promise<Blog | null> {
    return this.blogsService.updateBlog(id, updateBlogDTO);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteBlog(@Param('id') id: string): Promise<boolean | null> {
    return this.blogsService.deleteBlog(id);
  }

  @Delete()
  @HttpCode(204)
  async deleteAllBlogs(): Promise<boolean> {
    return this.blogsService.deleteAllBlogs();
  }
}
