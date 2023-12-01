import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';

import { Blog, BlogDocument, BlogModelType } from '../blog.entity';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}

  async save(blog: BlogDocument) {
    return blog.save();
  }

  async findBlogById(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new NotFoundException();
    }

    const blog = await this.BlogModel.findOne({ _id: id });

    if (!blog) {
      throw new NotFoundException();
    }

    return blog;
  }

  async findBlog(_id) {
    if (!mongoose.isValidObjectId(_id)) {
      throw new NotFoundException();
    }

    const blog = await this.BlogModel.findOne({ _id });

    if (!blog) {
      throw new NotFoundException();
    }

    return {
      id: blog._id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  }

  async deleteBlog(id: string): Promise<boolean> {
    const blog = await this.BlogModel.deleteOne({ _id: id });
    return blog.deletedCount === 1;
  }
}
