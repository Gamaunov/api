import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Comment } from './schemas/comment.entity';
import { CommentsRepository } from './comments.repository';
import { CommentInputDTO } from './dto/comment-input.dto';

import { ExceptionResultType } from '@/shared/types/exceptions.types';
import { ResultCode } from '@/shared/enums/result-code.enum';
import { commentIDField, commentNotFound } from '@/shared/constants/constants';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentsRepository: CommentsRepository,
  ) {}
  async updateCommentById(
    currentUserId: string,
    commentId: string,
    commentInputDTO: CommentInputDTO,
  ): Promise<ExceptionResultType<boolean>> {
    const comment = await this.commentsRepository.findCommentById(commentId);

    if (!comment) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: commentIDField,
        message: commentNotFound,
      };
    }

    if (comment.commentatorInfo.userId !== currentUserId) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    await comment.updateComment(commentInputDTO);
    await comment.save();

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
  async deleteCommentById(
    currentUserId: string,
    commentId: string,
  ): Promise<ExceptionResultType<boolean>> {
    const comment = await this.commentsRepository.findCommentById(commentId);

    if (!comment) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: commentIDField,
        message: commentNotFound,
      };
    }

    if (comment.commentatorInfo.userId !== currentUserId) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    await this.commentsRepository.deleteCommentById(commentId);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
  async deleteAllComments(): Promise<boolean> {
    return this.commentsRepository.deleteAllComments();
  }
}
