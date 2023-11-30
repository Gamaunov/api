import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { SortOrder } from 'mongoose';

import { Paginator } from '../../shared/genericTypes/paginator';
import { getLikeStatus } from '../../shared/utils/getLikeStatus';

import {
  Comment,
  CommentDTOType,
  CommentModelType,
} from './schemas/comment.entity';
import { CommentQuery } from './dto/comment.query';
import { CommentView } from './schemas/comment.view';
import { commentQueryValidator } from './heplers/validation/commentQueryValidator';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
  ) {}
  async findComments(
    query: CommentQuery,
    postId: string,
    userId: string,
  ): Promise<Paginator<CommentView[]>> {
    const queryData = commentQueryValidator(query);
    const filter = { postId };

    const sortCriteria: { [key: string]: SortOrder } = {
      [queryData.sortBy as string]: queryData.sortDirection,
    };

    const comments = await this.CommentModel.find(filter)
      .skip((+query.pageNumber - 1) * +query.pageSize)
      .limit(+query.pageSize)
      .sort(sortCriteria)
      .lean();

    const totalCount: number = await this.CommentModel.countDocuments(filter);

    return {
      pagesCount: Math.ceil(totalCount / +query.pageSize),
      page: +query.pageNumber,
      pageSize: +query.pageSize,
      totalCount,
      items: await this.commentsMapping(comments, userId),
    };
  }

  async findCommentById(
    commentId: string,
    userId?: string,
  ): Promise<CommentView | null> {
    if (!mongoose.isValidObjectId(commentId)) {
      return null;
    }

    const comment = await this.CommentModel.findOne({ _id: commentId });

    if (!comment) {
      return null;
    }

    const status: string = getLikeStatus(comment, userId);

    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt.toISOString(),
      likesInfo: {
        likesCount: comment.likesInfo.likesCount,
        dislikesCount: comment.likesInfo.dislikesCount,
        myStatus: status,
      },
    };
  }

  private async commentsMapping(
    comments: CommentDTOType[],
    userId: string,
  ): Promise<CommentView[]> {
    return Promise.all(
      comments.map(async (c) => {
        const status = getLikeStatus(c, userId);
        return {
          id: c._id.toString(),
          content: c.content,
          commentatorInfo: {
            userId: c.commentatorInfo.userId,
            userLogin: c.commentatorInfo.userLogin,
          },
          createdAt: c.createdAt.toISOString(),
          likesInfo: {
            likesCount: c.likesInfo.likesCount,
            dislikesCount: c.likesInfo.dislikesCount,
            myStatus: status,
          },
        };
      }),
    );
  }
}
