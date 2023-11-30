import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CommentsRepository } from '../../../../infrastructure/comments.repository';
import { ExceptionResultType } from '../../../../../../shared/types/exceptions.types';
import { ResultCode } from '../../../../../../shared/enums/result-code.enum';
import {
  commentIDField,
  commentNotFound,
} from '../../../../../../shared/constants/constants';

export class CommentDeleteCommand {
  constructor(public commentId: string, public userId: string) {}
}

@CommandHandler(CommentDeleteCommand)
export class CommentDeleteUseCase
  implements ICommandHandler<CommentDeleteCommand>
{
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute(
    command: CommentDeleteCommand,
  ): Promise<ExceptionResultType<boolean>> {
    const comment = await this.commentsRepository.findCommentById(
      command.commentId,
    );

    if (!comment) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: commentIDField,
        message: commentNotFound,
      };
    }

    if (comment.commentatorInfo.userId !== command.userId) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    await this.commentsRepository.deleteCommentById(command.commentId);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
