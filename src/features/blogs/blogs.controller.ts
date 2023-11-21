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
} from '@nestjs/common';

import { PostsService } from '../posts/posts.service';
import { PostsQueryRepository } from '../posts/posts.query.repository';
import { CreatePostDTO } from '../posts/dto/create-post.dto';
import { PostQuery } from '../posts/dto/post.query';

import { CreateBlogDTO } from './dto/create-blog.dto';
import { BlogQuery } from './dto/blog-query';
import { UpdateBlogDTO } from './dto/update-blog.dto';
import { BlogsService } from './blogs.service';
import { BlogsQueryRepository } from './blogs.query.repository';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  async findBlogs(@Query() query: BlogQuery) {
    return this.blogsQueryRepository.findBlogs(query);
  }

  @Get(':id')
  async findBlog(@Param('id') id: string) {
    return this.blogsQueryRepository.findBlog(id);
  }

  @Get('/:id/posts')
  async findPosts(@Query() query: PostQuery, @Param('id') id: string) {
    return this.postsQueryRepository.findPosts(query, id);
  }

  @Post()
  async createBlog(@Body() createBlogDTO: CreateBlogDTO) {
    return this.blogsService.createBlog(createBlogDTO);
  }

  @Post('/:id/posts')
  async createPost(
    @Param('id') id: string,
    @Body() createPostDTO: CreatePostDTO,
  ) {
    return this.postsService.createPost(createPostDTO, id);
  }

  @Put(':id')
  @HttpCode(204)
  async updateBlog(
    @Param('id') id: string,
    @Body() updateBlogDTO: UpdateBlogDTO,
  ) {
    return this.blogsService.updateBlog(id, updateBlogDTO);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteBlog(@Param('id') id: string) {
    return this.blogsService.deleteBlog(id);
  }
}
