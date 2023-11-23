import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, SortOrder } from 'mongoose';

import { Paginator } from '../../shared/genericTypes/paginator';
import { QueryParamsEnum } from '../../shared/enums/query-params.enum';
import { SortDirection } from '../../shared/enums/sort-direction.enum';

import { BlogView } from './schemas/blog.view';
import { Blog, BlogDocument, BlogModelType } from './schemas/blog.entity';
import { BlogQuery } from './dto/blog-query';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}

  async findBlogs(query: BlogQuery): Promise<Paginator<BlogView[]>> {
    const term = query.searchNameTerm;
    const sortBy = query.sortBy || QueryParamsEnum.createdAt;
    const sortDirection = query.sortDirection;
    const pageNumber = Number(query.pageNumber) || 1;
    const pageSize = Number(query.pageSize) || 10;

    const filter: FilterQuery<BlogDocument> = {};

    if (term) {
      filter.name = { $regex: term, $options: 'i' };
    }

    const currentSortDirection: { [key: string]: SortOrder } = {
      [sortBy]: SortDirection.DESC,
    };

    if (sortDirection === SortDirection.ASC) {
      currentSortDirection[sortBy] = SortDirection.ASC;
    }

    const blogs = await this.BlogModel.find(filter)
      .sort(currentSortDirection)
      .skip(pageNumber > 0 ? (pageNumber - 1) * pageSize : 0)
      .limit(pageSize > 0 ? pageSize : 0)
      .lean();

    const totalCount = await this.BlogModel.countDocuments(filter);
    const pagesCount = Math.ceil(totalCount / pageSize);

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
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

  async findBlog(id: string): Promise<BlogView | null> {
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
