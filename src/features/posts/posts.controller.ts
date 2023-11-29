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

import { CommentsQueryRepository } from '../comments/comments.query.repository';
import { CommentInputDTO } from '../comments/dto/comment-input.dto';
import { CommentQuery } from '../comments/dto/comment.query';
import { JwtBearerGuard } from '../auth/guards/jwt-bearer.guard';
import { UserIdFromGuard } from '../auth/decorators/user-id-from-guard.param.decorator';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { UserIdFromHeaders } from '../auth/decorators/user-id-from-headers.param.decorator';
import { LikeStatusInputDTO } from '../likes/dto/like-status-input.dto';
import { LikesService } from '../likes/likes.service';

import { PostsQueryRepository } from './posts.query.repository';
import { PostsService } from './posts.service';
import { PostInputDTO } from './dto/post-input.dto';
import { PostQuery } from './dto/post.query';

import {
  blogIDField,
  blogNotFound,
  postIDField,
  postNotFound,
} from '@/shared/constants/constants';
import { ResultCode } from '@/shared/enums/result-code.enum';
import { exceptionHandler } from '@/shared/exceptions/exception.handler';
import { PostView } from '@/features/posts/schemas/post.view';
import { CommentView } from '@/features/comments/schemas/comment.view';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly postsService: PostsService,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly likesService: LikesService,
  ) {}
  @Get()
  async findPosts(
    @Query() query: PostQuery,
    @UserIdFromHeaders() userId: string,
  ) {
    return this.postsQueryRepository.findPosts(query, userId);
  }
  @Get(':id')
  async findPostById(
    @Param('id') postId: string,
    @UserIdFromHeaders() userId: string,
  ): Promise<PostView | void> {
    const result: PostView = await this.postsQueryRepository.findPostById(
      postId,
      userId,
    );

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, postNotFound, postIDField);
    }

    return result;
  }
  @Get('/:id/comments')
  async findComments(
    @Query() query: CommentQuery,
    @Param('id') postId: string,
    @UserIdFromHeaders() userId: string,
  ) {
    const result = await this.commentsQueryRepository.findComments(
      query,
      postId,
      userId,
    );

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, postNotFound, postIDField);
    }

    return result;
  }
  @UseGuards(JwtBearerGuard)
  @Post('/:id/comments')
  async createComment(
    @UserIdFromGuard() userId: string,
    @Param('id') postId: string,
    @Body() commentInputDTO: CommentInputDTO,
  ): Promise<CommentView | void> {
    const commentId: string = await this.postsService.createComment(
      userId,
      postId,
      commentInputDTO,
    );

    if (!commentId) {
      return exceptionHandler(ResultCode.NotFound, postNotFound, postIDField);
    }

    return this.commentsQueryRepository.findCommentById(commentId);
  }
  @UseGuards(BasicAuthGuard)
  @Post()
  async createPost(
    @Body() postInputDTO: PostInputDTO,
  ): Promise<PostView | void> {
    const postId: string = await this.postsService.createPost(postInputDTO);

    if (!postId) {
      return exceptionHandler(ResultCode.BadRequest, blogNotFound, blogIDField);
    }

    return this.postsQueryRepository.findPostById(postId);
  }
  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(204)
  async updatePost(
    @Param('id') id: string,
    @Body() postInputDTO: PostInputDTO,
  ) {
    const result = await this.postsService.updatePost(id, postInputDTO);

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }
  @UseGuards(JwtBearerGuard)
  @Put(':id/like-status')
  @HttpCode(204)
  async updateLikeStatus(
    @UserIdFromGuard() userId: string,
    @Param('id') postId: string,
    @Body() likeStatusInputDTO: LikeStatusInputDTO,
  ): Promise<boolean | void> {
    const result: boolean = await this.likesService.updatePostLikes(
      postId,
      userId,
      likeStatusInputDTO.likeStatus,
    );

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, postNotFound, postIDField);
    }

    return result;
  }
  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async deletePostById(@Param('id') id: string) {
    const result: boolean = await this.postsService.deletePostById(id);

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, postNotFound, postIDField);
    }

    return result;
  }

  @Delete()
  @HttpCode(204)
  async deleteAllPosts(): Promise<boolean> {
    return this.postsService.deleteAllPosts();
  }
}
