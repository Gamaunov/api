import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { Post, PostLeanType, PostModelType } from '../domain/post.entity';
import { BlogsQueryRepository } from '../../blogs/infrastructure/blogs.query.repository';
import { QueryModel } from '../../../base/models/query.model';
import { Paginator } from '../../../base/pagination/_paginator';
import { paginateFeature } from '../../../base/pagination/paginate-feature';
import { postsFilter } from '../../../base/pagination/posts-filter';
import { sortDirection } from '../../../base/pagination/sort-direction';
import { getLikeStatus } from '../../../base/utils/likes/getLikeStatus';
import { PostViewModel } from '../models/post.view.model';
import { getThreeNewestLikes } from '../../../base/utils/likes/getThreeNewestLikes';
import { LikeStatus } from '../../../base/enums/like-status.enum';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async findPosts(
    query: QueryModel,
    userId?: string,
    blogId?: string,
  ): Promise<Paginator<PostViewModel[]> | null> {
    if (blogId) {
      const blog = await this.blogsQueryRepository.findBlogById(blogId);

      if (!blog) {
        return null;
      }
    }

    const posts = await paginateFeature(
      this.PostModel,
      query.pageNumber,
      query.pageSize,
      postsFilter(blogId),
      sortDirection(query.sortBy, query.sortDirection),
    );

    const totalCount = await this.PostModel.countDocuments(postsFilter(blogId));

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: await this.postsMapping(posts, userId),
    });
  }

  async findPostById(
    postId: string,
    userId?: string,
  ): Promise<PostViewModel | null> {
    if (!mongoose.isValidObjectId(postId)) {
      return null;
    }

    const post = await this.PostModel.findOne({ _id: postId });

    if (!post) {
      return null;
    }

    const status = getLikeStatus(post, userId);
    const newestLikes = getThreeNewestLikes(post.likesInfo.users);

    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: post.likesInfo.likesCount,
        dislikesCount: post.likesInfo.dislikesCount,
        myStatus: status,
        newestLikes: newestLikes,
      },
    };
  }

  private async postsMapping(
    posts: PostLeanType[],
    userId?: string,
  ): Promise<PostViewModel[]> {
    return posts.map((p) => {
      let status;
      if (typeof userId !== 'undefined') {
        status = getLikeStatus(p, userId);
      } else {
        status = LikeStatus.NONE;
      }

      const newestLikes = getThreeNewestLikes(p.likesInfo.users);

      return {
        id: p._id.toString(),
        title: p.title,
        shortDescription: p.shortDescription,
        content: p.content,
        blogId: p.blogId,
        blogName: p.blogName,
        createdAt: p.createdAt,
        extendedLikesInfo: {
          likesCount: p.likesInfo.likesCount,
          dislikesCount: p.likesInfo.dislikesCount,
          myStatus: status,
          newestLikes: newestLikes,
        },
      };
    });
  }
}
