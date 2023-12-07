import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';

import { paginateFeature } from '../../../shared/pagination/paginate-feature';
import { sortDirection } from '../../../shared/pagination/sort-direction';
import { Paginator } from '../../../shared/pagination/_paginator';
import { blogsFilter } from '../../../shared/pagination/blogs-filter';
import { Blog, BlogLeanType, BlogModelType } from '../blog.entity';
import { BlogQuery } from '../dto/blog-query';
import { BlogViewDto } from '../dto/blog-view.dto';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}

  async findBlogs(
    query: BlogQuery,
    userId?: string,
  ): Promise<Paginator<BlogViewDto[]>> {
    const blogs = await paginateFeature(
      this.BlogModel,
      query.pageNumber,
      query.pageSize,
      blogsFilter(query.searchNameTerm, userId),
      sortDirection(query.sortBy, query.sortDirection),
    );

    const totalCount = await this.BlogModel.countDocuments(
      blogsFilter(query.searchNameTerm, userId),
    );

    const items = await this.blogsMapping(blogs);

    return Paginator.paginate({
      pageNumber: +query.pageNumber,
      pageSize: +query.pageSize,
      totalCount: totalCount,
      items: items,
    });
  }

  async findBlogById(id: string): Promise<BlogViewDto | null> {
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
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  }

  private async blogsMapping(blogs: BlogLeanType[]): Promise<BlogViewDto[]> {
    return blogs.map((b) => {
      return {
        id: b._id.toString(),
        name: b.name,
        description: b.description,
        websiteUrl: b.websiteUrl,
        createdAt: b.createdAt,
        isMembership: b.isMembership,
      };
    });
  }
}
