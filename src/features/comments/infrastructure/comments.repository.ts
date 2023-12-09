import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';

import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
  ) {}
  async save(comment: CommentDocument) {
    return comment.save();
  }
  async findCommentById(id: string): Promise<CommentDocument | null> {
    if (!mongoose.isValidObjectId(id)) {
      return null;
    }

    const comment = await this.CommentModel.findOne({ _id: id });

    if (!comment) {
      return null;
    }

    return comment;
  }
  async deleteCommentById(id: string): Promise<boolean> {
    const comment = await this.CommentModel.deleteOne({ _id: id });
    return comment.deletedCount === 1;
  }
  async deleteAllComments(): Promise<boolean> {
    await this.CommentModel.deleteMany({});
    return (await this.CommentModel.countDocuments()) === 0;
  }
}
