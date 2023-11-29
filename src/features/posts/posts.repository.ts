import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';

import { Post, PostDocument, PostModelType } from './schemas/post.entity';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
  ) {}

  async save(post: PostDocument) {
    return post.save();
  }
  async findPostById(id: string): Promise<PostDocument | null> {
    if (!mongoose.isValidObjectId(id)) {
      throw new NotFoundException();
    }

    const post = await this.PostModel.findOne({ _id: id });

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  async deletePostById(id: string): Promise<boolean> {
    const post = await this.PostModel.deleteOne({ _id: id });
    return post.deletedCount === 1;
  }

  async deleteAllPosts(): Promise<boolean> {
    await this.PostModel.deleteMany({});
    return (await this.PostModel.countDocuments()) === 0;
  }
}
