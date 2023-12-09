import { HydratedDocument, Model, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { PostDocument } from '../../posts/domain/post.entity';
import { UserDocument } from '../../users/domain/user.entity';
import { LikesInfoSchema } from '../../likes/schemas/likes-info.schema';
import { CommentInputModel } from '../models/comment-input.model';
import { CommentatorInfoSchema } from '../schemas/commentator.info.schema';

interface IUpdateCommentModel {
  content: string;
}

export type CommentDocument = HydratedDocument<Comment>;
export type CommentDTOType = Comment & { _id: Types.ObjectId };

export type CommentModelStaticType = {
  createComment: (
    CommentModel: CommentModelType,
    commentInputModel: CommentInputModel,
    post: PostDocument,
    user: UserDocument,
  ) => CommentDocument;
};

export type CommentModelType = Model<Comment> & CommentModelStaticType;

@Schema()
export class Comment {
  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  commentatorInfo: CommentatorInfoSchema;

  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  likesInfo: LikesInfoSchema;

  updateComment(updateCommentModel: IUpdateCommentModel): void {
    this.content = updateCommentModel.content;
  }

  static createComment(
    CommentModel: CommentModelType,
    commentInputModel: CommentInputModel,
    post: PostDocument,
    user: UserDocument,
  ): CommentDocument {
    const comment = {
      content: commentInputModel.content,
      commentatorInfo: {
        userId: user.id,
        userLogin: user.accountData.login,
      },
      postId: post._id.toString(),
      createdAt: new Date(),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        users: [],
      },
    };
    return new CommentModel(comment);
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.methods = {
  updateComment: Comment.prototype.updateComment,
};

const commentStaticMethods: CommentModelStaticType = {
  createComment: Comment.createComment,
};

CommentSchema.statics = commentStaticMethods;
