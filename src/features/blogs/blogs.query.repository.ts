import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { SortOrder } from 'mongoose';

import { BlogView } from './schemas/blog.view';
import { Blog, BlogModelType } from './schemas/blog.entity';
import { BlogQuery } from './dto/blog-query';
import { blogsQueryValidator } from './helpers/validation/blogsQueryValidator';

import { Paginator } from '@/shared/genericTypes/paginator';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}

  async findBlogs(query: BlogQuery): Promise<Paginator<BlogView[]>> {
    const queryData = blogsQueryValidator(query);

    const filter = {
      name: { $regex: queryData.searchNameTerm ?? '', $options: 'i' },
    };

    const sortCriteria: { [key: string]: SortOrder } = {
      [queryData.sortBy as string]: queryData.sortDirection,
    };

    const blogs = await this.BlogModel.find(filter)
      .skip((+query.pageNumber - 1) * +query.pageSize)
      .limit(+query.pageSize)
      .sort(sortCriteria)
      .lean();

    const totalCount: number = await this.BlogModel.countDocuments(filter);

    return {
      pagesCount: Math.ceil(totalCount / +query.pageSize),
      page: +query.pageNumber,
      pageSize: +query.pageSize,
      totalCount,
      items: blogs.map((blog) => {
        return {
          id: blog._id.toString(),
          name: blog.name,
          description: blog.description,
          websiteUrl: blog.websiteUrl,
          createdAt: blog.createdAt.toISOString(),
          isMembership: blog.isMembership,
        };
      }),
    };
  }

  async findBlogById(id: string): Promise<BlogView | null> {
    if (!mongoose.isValidObjectId(id)) {
      return null;
    }

    const blog = await this.BlogModel.findOne({ _id: id });

    if (!blog) {
      return null;
    }

    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt.toISOString(),
      isMembership: blog.isMembership,
    };
  }
}
