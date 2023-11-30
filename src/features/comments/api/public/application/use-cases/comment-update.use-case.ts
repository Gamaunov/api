import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CommentInputDTO } from '../../../../dto/comment-input.dto';
import { CommentsRepository } from '../../../../infrastructure/comments.repository';
import { ExceptionResultType } from '../../../../../../shared/types/exceptions.types';
import { ResultCode } from '../../../../../../shared/enums/result-code.enum';
import {
  commentIDField,
  commentNotFound,
} from '../../../../../../shared/constants/constants';

export class CommentUpdateCommand {
  constructor(
    public commentInputDTO: CommentInputDTO,
    public commentId: string,
    public userId: string,
  ) {}
}

@CommandHandler(CommentUpdateCommand)
export class CommentUpdateUseCase
  implements ICommandHandler<CommentUpdateCommand>
{
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute(
    command: CommentUpdateCommand,
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

    await comment.updateComment(command.commentInputDTO);
    await comment.save();

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
