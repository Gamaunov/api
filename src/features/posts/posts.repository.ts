import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';

import { Blog, BlogModelType } from '../blogs/schemas/blog.entity';
import { LikeStatus } from '../../shared/enums/like-status.enum';

import { Post, PostDocument, PostModelType } from './schemas/post.entity';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}

  async save(post: PostDocument) {
    return post.save();
  }

  async createPost(post: PostDocument) {
    await post.save();
    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt.toISOString(),
      extendedLikesInfo: {
        likesCount: post.likesInfo.likesCount,
        dislikesCount: post.likesInfo.dislikesCount,
        myStatus: LikeStatus.NONE,
        newestLikes: [],
      },
    };
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

  async findUserLikeStatus(
    postId: string,
    userId: string,
  ): Promise<string | null> {
    const user = await this.PostModel.findOne(
      { _id: postId },
      {
        'likesInfo.users': {
          $filter: {
            input: '$likesInfo.users',
            cond: { $eq: ['$$this.userId', userId.toString()] },
          },
        },
      },
    );

    if (!user || Number(user.likesInfo.users.length) === 0) {
      return null;
    }

    return user.likesInfo.users[0].likeStatus;
  }

  async deletePost(id: string): Promise<boolean> {
    const post = await this.PostModel.deleteOne({ _id: id });
    return post.deletedCount === 1;
  }

  async deleteAllPosts(): Promise<boolean> {
    await this.PostModel.deleteMany({});
    return (await this.PostModel.countDocuments()) === 0;
  }
}
