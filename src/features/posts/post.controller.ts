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

import { CommentsQueryRepository } from '../comments/comments.query.repository';
import { CreateCommentDTO } from '../comments/dto/create-comment.dto';
import { CommentQuery } from '../comments/dto/comment.query';

import { PostsQueryRepository } from './posts.query.repository';
import { PostsService } from './posts.service';
import { CreatePostDTO } from './dto/create-post.dto';
import { PostQuery } from './dto/post.query';
import { UpdatePostDTO } from './dto/update-post.dto';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly postsService: PostsService,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get(':id')
  async findPost(@Param('id') id: string) {
    return this.postsQueryRepository.findPost(id);
  }

  @Get()
  async findPosts(@Query() query: PostQuery) {
    return this.postsQueryRepository.findPosts(query);
  }

  @Get('/:id/comments')
  async findComments(@Query() query: CommentQuery, @Param('id') id: string) {
    return this.commentsQueryRepository.findComments(query, id);
  }

  @Post('/:id/comments')
  async createComment(
    @Param('id') id: string,
    @Body() createCommentDTO: CreateCommentDTO,
  ) {
    return this.postsService.createComment(id, createCommentDTO);
  }

  @Post()
  async createPost(@Body() createPostDTO: CreatePostDTO) {
    return this.postsService.createPost(createPostDTO);
  }

  @Put(':id')
  @HttpCode(204)
  async updatePost(
    @Param('id') id: string,
    @Body() updatePostDTO: UpdatePostDTO,
  ) {
    return this.postsService.updatePost(id, updatePostDTO);
  }

  @Delete(':id')
  @HttpCode(204)
  async deletePost(@Param('id') id: string) {
    return this.postsService.deletePost(id);
  }

  @Delete()
  @HttpCode(204)
  async deletePosts() {
    return this.postsService.deletePosts();
  }
}
