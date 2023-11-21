import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { CreateCommentDTO } from '../dto/create-comment.dto';
import { PostDocument } from '../../posts/schemas/post.entity';
import { LikesInfoSchema } from '../../../shared/schemas/likes-info.schema';

import { CommentatorInfoSchema } from './commentator.info.schema';

export type CommentDocument = HydratedDocument<Comment>;

export type CommentModelStaticType = {
  createComment: (
    createCommentDTO: CreateCommentDTO,
    CommentModel: CommentModelType,
    post: PostDocument,
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
  extendedLikesInfo: LikesInfoSchema;

  static createComment(
    createCommentDTO: CreateCommentDTO,
    CommentModel: CommentModelType,
    post: PostDocument,
  ): CommentDocument {
    const comment = {
      content: createCommentDTO.content,
      commentatorInfo: {
        userId: 'testUserId',
        userLogin: 'testUserLogin',
      },
      postId: post._id.toString(),
      createdAt: new Date(),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        users: [],
      },
    };
    return new CommentModel(comment);
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

const commentStaticMethods: CommentModelStaticType = {
  createComment: Comment.createComment,
};

CommentSchema.statics = commentStaticMethods;
