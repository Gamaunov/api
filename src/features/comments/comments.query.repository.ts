import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { SortOrder } from 'mongoose';

import { Paginator } from '../../shared/genericTypes/paginator';
import { LikeStatus } from '../../shared/enums/like-status.enum';

import { Comment, CommentModelType } from './schemas/comment.entity';
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
  ): Promise<Paginator<CommentView[]>> {
    // const sortBy = query.sortBy || QueryParamsEnum.createdAt;
    // const sortDirection = query.sortDirection;
    // const pageNumber = Number(query.pageNumber) || 1;
    // const pageSize = Number(query.pageSize) || 10;
    //
    // const filter: FilterQuery<CommentDocument> = { postId };
    //
    // const currentSortDirection: { [key: string]: SortOrder } = {
    //   [sortBy]: SortDirection.DESC,
    // };
    //
    // if (sortDirection === SortDirection.ASC) {
    //   currentSortDirection[sortBy] = SortDirection.ASC;
    // }
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

    const totalCount = await this.CommentModel.countDocuments(filter);

    return {
      pagesCount: Math.ceil(totalCount / +query.pageSize),
      page: +query.pageNumber,
      pageSize: +query.pageSize,
      totalCount,
      items: comments.map((comment) => {
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
            myStatus: LikeStatus.NONE,
          },
        };
      }),
    };
  }

  async findComment(id: string): Promise<CommentView> {
    if (!mongoose.isValidObjectId(id)) {
      throw new NotFoundException();
    }

    const comment = await this.CommentModel.findOne({ _id: id });

    if (!comment) {
      throw new NotFoundException();
    }

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
        myStatus: LikeStatus.NONE,
      },
    };
  }
}
