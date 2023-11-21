import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, SortOrder } from 'mongoose';

import { Blog, BlogModelType } from '../blogs/schemas/blog.entity';
import { Paginator } from '../../shared/genericTypes/paginator';
import { QueryParamsEnum } from '../../shared/enums/query-params.enum';
import { SortDirection } from '../../shared/enums/sort-direction.enum';
import { LikeStatus } from '../../shared/enums/like-status.enum';

import { Post, PostDocument, PostModelType } from './schemas/post.entity';
import { PostQuery } from './dto/post.query';
import { PostView } from './schemas/post.view';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}

  async findPosts(
    query: PostQuery,
    blogId?: string,
  ): Promise<Paginator<PostView[]>> {
    const sortBy = query.sortBy || QueryParamsEnum.createdAt;
    const sortDirection = query.sortDirection;
    const pageNumber = Number(query.pageNumber) || 1;
    const pageSize = Number(query.pageSize) || 10;

    const filter: FilterQuery<PostDocument> = {};

    if (blogId) {
      if (!mongoose.isValidObjectId(blogId)) {
        throw new NotFoundException();
      }

      const blog = await this.BlogModel.findOne({ _id: blogId });

      if (!blog) {
        throw new NotFoundException();
      }

      filter.blogId = blogId;
    }

    const currentSortDirection: { [key: string]: SortOrder } = {
      [sortBy]: SortDirection.DESC,
    };

    if (sortDirection === SortDirection.ASC) {
      currentSortDirection[sortBy] = SortDirection.ASC;
    }

    const posts = await this.PostModel.find(filter)
      .sort(currentSortDirection)
      .skip(pageNumber > 0 ? (pageNumber - 1) * pageSize : 0)
      .limit(pageSize > 0 ? pageSize : 0)
      .lean();

    const totalCount = await this.PostModel.countDocuments(filter);
    const pagesCount = Math.ceil(totalCount / pageSize);

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
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
