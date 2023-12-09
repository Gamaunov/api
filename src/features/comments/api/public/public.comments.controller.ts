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
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CommentsQueryRepository } from '../../infrastructure/comments.query.repository';
import { exceptionHandler } from '../../../../infrastructure/exception-filters/exception.handler';
import { ResultCode } from '../../../../base/enums/result-code.enum';
import {
  commentIDField,
  commentNotFound,
} from '../../../../base/constants/constants';
import { JwtBearerGuard } from '../../../auth/guards/jwt-bearer.guard';
import { CommentInputModel } from '../../models/comment-input.model';
import { UserIdFromGuard } from '../../../auth/decorators/user-id-from-guard.guard.decorator';
import { LikeStatusInputModel } from '../../../likes/models/like-status-input.model';
import { LikeUpdateForCommentCommand } from '../../../likes/api/public/application/use-cases/like-update-for-comment-use.case';
import { CommentViewModel } from '../../models/comment.view.model';
import { UserIdFromHeaders } from '../../../auth/decorators/user-id-from-headers.decorator';

import { CommentUpdateCommand } from './application/use-cases/comment-update.use-case';
import { CommentDeleteCommand } from './application/use-cases/comment-delete.use-case';

@ApiTags('comments')
@Controller('comments')
export class PublicCommentsController {
  constructor(
    private commandBus: CommandBus,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Return comment by id' })
  async findComment(
    @Param('id') commentId: string,
    @UserIdFromHeaders() userId: string,
  ): Promise<void | CommentViewModel> {
    const result: CommentViewModel =
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

  @Put(':id')
  @ApiOperation({ summary: 'Update existing comment by id with InputModel' })
  @UseGuards(JwtBearerGuard)
  @HttpCode(204)
  async updateComment(
    @Body() commentInputModel: CommentInputModel,
    @Param('id') commentId: string,
    @UserIdFromGuard() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new CommentUpdateCommand(commentInputModel, commentId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  @Put(':id/like-status')
  @ApiOperation({ summary: 'Make like/unlike/dislike/undislike operation' })
  @UseGuards(JwtBearerGuard)
  @HttpCode(204)
  async updateLikeStatus(
    @Body() likeStatusInputModel: LikeStatusInputModel,
    @Param('id') commentId: string,
    @UserIdFromGuard() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new LikeUpdateForCommentCommand(likeStatusInputModel, commentId, userId),
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

  @Delete(':id')
  @ApiOperation({ summary: 'Delete comment specified by id' })
  @UseGuards(JwtBearerGuard)
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
