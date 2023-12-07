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
import { CommandBus } from '@nestjs/cqrs';

import { CommentsQueryRepository } from '../../infrastructure/comments.query.repository';
import { exceptionHandler } from '../../../../shared/exceptions/exception.handler';
import { ResultCode } from '../../../../shared/enums/result-code.enum';
import {
  commentIDField,
  commentNotFound,
} from '../../../../shared/constants/constants';
import { JwtBearerGuard } from '../../../auth/guards/jwt-bearer.guard';
import { CommentInputDto } from '../../dto/comment-input.dto';
import { UserIdFromGuard } from '../../../auth/decorators/user-id-from-guard.guard.decorator';
import { LikeStatusInputDto } from '../../../likes/dto/like-status-input.dto';
import { LikeUpdateForCommentCommand } from '../../../likes/api/public/application/use-cases/like-update-for-comment-use.case';
import { CommentViewDto } from '../../dto/comment-view.dto';
import { UserIdFromHeaders } from '../../../auth/decorators/user-id-from-headers.decorator';

import { CommentUpdateCommand } from './application/use-cases/comment-update.use-case';
import { CommentDeleteCommand } from './application/use-cases/comment-delete.use-case';

@Controller('comments')
export class PublicCommentsController {
  constructor(
    private commandBus: CommandBus,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get(':id')
  async findComment(
    @Param('id') commentId: string,
    @UserIdFromHeaders() userId: string,
  ): Promise<void | CommentViewDto> {
    const result: CommentViewDto =
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
  async updateComment(
    @Body() commentInputDto: CommentInputDto,
    @Param('id') commentId: string,
    @UserIdFromGuard() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new CommentUpdateCommand(commentInputDto, commentId, userId),
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
    @Body() likeStatusInputDto: LikeStatusInputDto,
    @Param('id') commentId: string,
    @UserIdFromGuard() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new LikeUpdateForCommentCommand(likeStatusInputDto, commentId, userId),
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
    @Param('id') commentId: string,
    @UserIdFromGuard() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new CommentDeleteCommand(commentId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }
}
