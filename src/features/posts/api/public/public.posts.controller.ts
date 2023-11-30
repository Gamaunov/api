import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { CommentsQueryRepository } from '../../../comments/infrastructure/comments.query.repository';
import { QueryDTO } from '../../../../shared/dto/query.dto';
import {
  postIDField,
  postNotFound,
} from '../../../../shared/constants/constants';
import { ResultCode } from '../../../../shared/enums/result-code.enum';
import { exceptionHandler } from '../../../../shared/exceptions/exception.handler';
import { JwtBearerGuard } from '../../../auth/guards/jwt-bearer.guard';
import { CommentInputDTO } from '../../../comments/dto/comment-input.dto';
import { UserIdFromGuard } from '../../../auth/decorators/user-id-from-guard.param.decorator';
import { CommentCreateCommand } from '../../../comments/api/public/application/use-cases/comment-create.use-case';
import { LikeStatusInputDTO } from '../../../likes/dto/like-status-input.dto';
import { LikeUpdateForPostCommand } from '../../../likes/api/public/application/use-cases/like-update-for-post-use.case';
import { PostsQueryRepository } from '../../infrastructure/posts.query.repository';

@Controller('posts')
export class PublicPostsController {
  constructor(
    private commandBus: CommandBus,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get()
  async findPosts(@Query() query: QueryDTO, @UserIdFromGuard() userId) {
    return this.postsQueryRepository.findPosts(query, userId);
  }

  @Get(':id')
  async findPost(@Param('id') postId, @UserIdFromGuard() userId) {
    const result = await this.postsQueryRepository.findPost(postId, userId);

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, postNotFound, postIDField);
    }

    return result;
  }

  @Get(':id/comments')
  async findComments(
    @Query() query: QueryDTO,
    @Param('id') postId,
    @UserIdFromGuard() userId,
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
  @Post(':id/comments')
  async createComment(
    @Body() commentInputDTO: CommentInputDTO,
    @Param('id') postId,
    @UserIdFromGuard() userId,
  ) {
    const commentId = await this.commandBus.execute(
      new CommentCreateCommand(commentInputDTO, postId, userId),
    );

    if (!commentId) {
      return exceptionHandler(ResultCode.NotFound, postNotFound, postIDField);
    }

    return this.commentsQueryRepository.findCommentById(commentId);
  }

  @UseGuards(JwtBearerGuard)
  @Put(':id/like-status')
  @HttpCode(204)
  async updateLikeStatus(
    @Body() likeStatusInputDto: LikeStatusInputDTO,
    @Param('id') postId,
    @UserIdFromGuard() userId,
  ) {
    const result = await this.commandBus.execute(
      new LikeUpdateForPostCommand(likeStatusInputDto, postId, userId),
    );

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, postNotFound, postIDField);
    }

    return result;
  }
}
