import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';

import { Blog, BlogModelType } from '../blogs/schemas/blog.entity';
import { Paginator } from '../../shared/genericTypes/paginator';
import { LikeStatus } from '../../shared/enums/like-status.enum';

import { Post, PostModelType } from './schemas/post.entity';
import { PostQuery } from './dto/post.query';
import { PostView } from './schemas/post.view';
import { postQueryValidator } from './helpers/validation/postQueryValidator';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}

  async findPosts(queryData: PostQuery): Promise<Paginator<PostView[]>> {
    const filter = {};

    const query = postQueryValidator(queryData);

    const sortCriteria: { [key: string]: any } = {
      [query.sortBy as string]: query.sortDirection,
    };

    const posts = await this.PostModel.find(filter)
      .sort(sortCriteria)
      .skip((+query.pageNumber - 1) * +query.pageSize)
      .limit(query.pageSize)
      .lean();

    const totalCount = await this.PostModel.countDocuments(filter);

    return {
      pagesCount: Math.ceil(totalCount / +query.pageSize),
      page: +query.pageNumber,
      pageSize: +query.pageSize,
      totalCount,
      items: posts.map((post) => {
        return {
          id: post._id.toString(),
          title: post.title,
          shortDescription: post.shortDescription,
          content: post.content,
          blogId: post.blogId,
          blogName: post.blogName,
          createdAt: post.createdAt.toISOString(),
          extendedLikesInfo: {
            likesCount: post.extendedLikesInfo.likesCount,
            dislikesCount: post.extendedLikesInfo.dislikesCount,
            myStatus: LikeStatus.NONE,
            newestLikes: [],
          },
        };
      }),
    };
  }

  async findPost(id: string): Promise<PostView> {
    if (!mongoose.isValidObjectId(id)) {
      throw new NotFoundException();
    }

    const post = await this.PostModel.findOne({ _id: id });

    if (!post) {
      throw new NotFoundException();
    }

    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt.toISOString(),
      extendedLikesInfo: {
        likesCount: post.extendedLikesInfo.likesCount,
        dislikesCount: post.extendedLikesInfo.dislikesCount,
        myStatus: LikeStatus.NONE,
        newestLikes: [],
      },
    };
  }
}
