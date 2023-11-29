import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery } from 'mongoose';

import { Post, PostDTOType, PostModelType } from './schemas/post.entity';
import { PostQuery } from './dto/post.query';
import { PostView } from './schemas/post.view';
import { postQueryValidator } from './helpers/validation/postQueryValidator';

import { getLikeStatus } from '@/shared/utils/getLikeStatus';
import { getThreeNewestLikes } from '@/shared/utils/getThreeNewestLikes';
import { Paginator } from '@/shared/genericTypes/paginator';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
  ) {}

  async findPosts(
    queryData: PostQuery,
    userId: string,
    blogId?: string,
  ): Promise<Paginator<PostView[]> | null> {
    const filter: FilterQuery<PostModelType> = {};

    if (blogId) {
      filter.blogId = blogId;

      const foundBlog = await this.PostModel.findOne({
        blogId,
      });

      if (!foundBlog) {
        return null;
      }
    }

    const query = postQueryValidator(queryData);

    const sortCriteria: { [key: string]: any } = {
      [query.sortBy as string]: query.sortDirection,
    };

    const posts = await this.PostModel.find(filter)
      .sort(sortCriteria)
      .skip((+query.pageNumber - 1) * +query.pageSize)
      .limit(query.pageSize)
      .lean();

    const postItems: PostView[] = await this.postsMapping(posts, userId);

    const totalCount: number = await this.PostModel.countDocuments(filter);

    return {
      pagesCount: Math.ceil(totalCount / +query.pageSize),
      page: +query.pageNumber,
      pageSize: +query.pageSize,
      totalCount,
      items: postItems,
    };
  }

  async findPostById(
    postId: string,
    userId?: string,
  ): Promise<PostView | null> {
    if (!mongoose.isValidObjectId(postId)) {
      return null;
    }

    const post = await this.PostModel.findOne({ _id: postId });

    if (!post) {
      return null;
    }

    const status: string = getLikeStatus(post, userId);

    const usersLikes = post.likesInfo.users;
    const threeNewestLikesArray = getThreeNewestLikes(usersLikes);

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
        myStatus: status,
        newestLikes: threeNewestLikesArray,
      },
    };
  }

  private async postsMapping(
    posts: PostDTOType[],
    userId: string,
  ): Promise<PostView[]> {
    return posts.map((p) => {
      const status = getLikeStatus(p, userId);

      const usersLikes = p.likesInfo.users;

      const threeNewestLikesArray = getThreeNewestLikes(usersLikes);

      return {
        id: p._id.toString(),
        title: p.title,
        shortDescription: p.shortDescription,
        content: p.content,
        blogId: p.blogId,
        blogName: p.blogName,
        createdAt: p.createdAt.toISOString(),
        extendedLikesInfo: {
          likesCount: p.likesInfo.likesCount,
          dislikesCount: p.likesInfo.dislikesCount,
          myStatus: status,
          newestLikes: threeNewestLikesArray,
        },
      };
    });
  }
}
