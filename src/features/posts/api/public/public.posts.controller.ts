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
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CommentsQueryRepository } from '../../../comments/infrastructure/comments.query.repository';
import { QueryModel } from '../../../../base/models/query.model';
import {
  postIDField,
  postNotFound,
} from '../../../../base/constants/constants';
import { ResultCode } from '../../../../base/enums/result-code.enum';
import { exceptionHandler } from '../../../../infrastructure/exception-filters/exception.handler';
import { JwtBearerGuard } from '../../../auth/guards/jwt-bearer.guard';
import { CommentInputModel } from '../../../comments/models/comment-input.model';
import { UserIdFromGuard } from '../../../auth/decorators/user-id-from-guard.guard.decorator';
import { CommentCreateCommand } from '../../../comments/api/public/application/use-cases/comment-create.use-case';
import { LikeStatusInputModel } from '../../../likes/models/like-status-input.model';
import { LikeUpdateForPostCommand } from '../../../likes/api/public/application/use-cases/like-update-for-post-use.case';
import { PostsQueryRepository } from '../../infrastructure/posts.query.repository';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { Post as ClassPost, PostModelType } from '../../domain/post.entity';
import { UserIdFromHeaders } from '../../../auth/decorators/user-id-from-headers.decorator';
import { PostUpdateCommand } from '../blogger/application/use-cases/post-update.use-case';
import { BasicAuthGuard } from '../../../auth/guards/basic-auth.guard';
import { PostCreateCommand } from '../blogger/application/use-cases/post-create.use-case';
import { CreatePostInputModel } from '../../models/create-post-input.model';
@ApiTags('posts')
@Controller('posts')
export class PublicPostsController {
  constructor(
    @InjectModel(ClassPost.name)
    private PostModel: PostModelType,
    private commandBus: CommandBus,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly postsRepository: PostsRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Returns all posts',
  })
  async findPosts(
    @Query() query: QueryModel,
    @UserIdFromHeaders() userId: string,
  ) {
    return this.postsQueryRepository.findPosts(query, userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Return post by id',
  })
  async findPost(
    @Param('id') postId: string,
    @UserIdFromHeaders() userId: string,
  ) {
    const result = await this.postsQueryRepository.findPostById(postId, userId);

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, postNotFound, postIDField);
    }

    return result;
  }

  @Get(':id/comments')
  @ApiOperation({
    summary: 'Returns comments for specified post',
  })
  async findComments(
    @Query() query: QueryModel,
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

  @Post()
  @ApiOperation({
    summary: 'Create new post',
  })
  @UseGuards(BasicAuthGuard)
  @HttpCode(201)
  async createPost(@Body() createPostInputModel: CreatePostInputModel) {
    const result = await this.commandBus.execute(
      new PostCreateCommand(createPostInputModel, createPostInputModel.blogId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return this.postsQueryRepository.findPostById(result.response);
  }

  @Post(':id/comments')
  @ApiOperation({
    summary: 'Create new comment',
  })
  @UseGuards(JwtBearerGuard)
  @HttpCode(201)
  async createComment(
    @Body() commentInputModel: CommentInputModel,
    @Param('id') postId: string,
    @UserIdFromGuard() userId: string,
  ) {
    const commentId = await this.commandBus.execute(
      new CommentCreateCommand(commentInputModel, postId, userId),
    );

    if (!commentId) {
      return exceptionHandler(ResultCode.NotFound, postNotFound, postIDField);
    }

    return this.commentsQueryRepository.findCommentById(commentId);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update existing post by id with InputModel',
  })
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async updatePost(
    @Body() createPostInputModel: CreatePostInputModel,
    @Param('id') postId: string,
    @UserIdFromGuard() userId: string,
  ) {
    const command = new PostUpdateCommand(
      createPostInputModel,
      createPostInputModel.blogId,
      postId,
      userId,
    );
    const result = await this.commandBus.execute(command);

    if (!result.data) {
      return exceptionHandler(result.code, result.message, result.field);
    }
  }

  @Put(':id/like-status')
  @ApiOperation({
    summary: 'Make like/unlike/dislike/undislike operation',
  })
  @UseGuards(JwtBearerGuard)
  @HttpCode(204)
  async updateLikeStatus(
    @Body() likeStatusInputModel: LikeStatusInputModel,
    @Param('id') postId: string,
    @UserIdFromGuard() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new LikeUpdateForPostCommand(likeStatusInputModel, postId, userId),
    );

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, postNotFound, postIDField);
    }

    return result;
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete post specified by id',
  })
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async deletePost(@Param('id') postId: string) {
    const post = await this.postsQueryRepository.findPostById(postId);

    if (!post) {
      return exceptionHandler(ResultCode.NotFound, postNotFound, postIDField);
    }

    await this.postsRepository.deletePostById(postId);
  }
}
