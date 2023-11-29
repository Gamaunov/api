import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';

import { UserIdFromHeaders } from '../auth/decorators/user-id-from-headers.param.decorator';
import { JwtBearerGuard } from '../auth/guards/jwt-bearer.guard';
import { UserIdFromGuard } from '../auth/decorators/user-id-from-guard.param.decorator';
import { LikeStatusInputDTO } from '../likes/dto/like-status-input.dto';
import { LikesService } from '../likes/likes.service';

import { CommentsService } from './comments.service';
import { CommentsQueryRepository } from './comments.query.repository';
import { CommentInputDTO } from './dto/comment-input.dto';

import { commentIDField, commentNotFound } from '@/shared/constants/constants';
import { ResultCode } from '@/shared/enums/result-code.enum';
import { exceptionHandler } from '@/shared/exceptions/exception.handler';
import { CommentView } from '@/features/comments/schemas/comment.view';
import { ExceptionResultType } from '@/shared/types/exceptions.types';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commentsService: CommentsService,
    private readonly likesService: LikesService,
  ) {}

  @Get(':id')
  async findCommentById(
    @Param('id') commentId: string,
    @UserIdFromHeaders() userId: string,
  ) {
    const result: CommentView =
      await this.commentsQueryRepository.findCommentById(commentId, userId);

    if (!result) {
      return exceptionHandler(
        ResultCode.NotFound,
        commentNotFound,
        commentIDField,
      );
    }

    return result;
  }
  @UseGuards(JwtBearerGuard)
  @Put(':id')
  @HttpCode(204)
  async updateCommentById(
    @UserIdFromGuard() userId: string,
    @Param('id') commentId: string,
    @Body() commentInputDto: CommentInputDTO,
  ): Promise<void | ExceptionResultType<boolean>> {
    const result: ExceptionResultType<boolean> =
      await this.commentsService.updateCommentById(
        userId,
        commentId,
        commentInputDto,
      );

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
    @Param('id') commentId: string,
    @Body() likeStatusInputDTO: LikeStatusInputDTO,
  ): Promise<boolean | void> {
    const result: boolean = await this.likesService.updateCommentLikes(
      commentId,
      userId,
      likeStatusInputDTO.likeStatus,
    );

    if (!result) {
      return exceptionHandler(
        ResultCode.NotFound,
        commentNotFound,
        commentIDField,
      );
    }

    return result;
  }
  @UseGuards(JwtBearerGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteComment(
    @UserIdFromGuard() userId: string,
    @Param('id') commentId: string,
  ): Promise<void | ExceptionResultType<boolean>> {
    const result: ExceptionResultType<boolean> =
      await this.commentsService.deleteCommentById(userId, commentId);

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }
  @Delete()
  @HttpCode(204)
  async deleteComments(): Promise<boolean> {
    return this.commentsService.deleteAllComments();
  }
}
