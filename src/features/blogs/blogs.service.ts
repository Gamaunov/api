import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Blog, BlogModelType } from './schemas/blog.entity';
import { BlogsRepository } from './blogs.repository';
import { CreateBlogDTO } from './dto/create-blog.dto';
import { BlogView } from './schemas/blog.view';
import { UpdateBlogDTO } from './dto/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async createBlog(createBlogDto: CreateBlogDTO): Promise<BlogView> {
    const blog = this.BlogModel.createBlog(createBlogDto, this.BlogModel);
    return this.blogsRepository.createBlog(blog);
  }

  async updateBlog(
    id: string,
    updateBlogDto: UpdateBlogDTO,
  ): Promise<Blog | null> {
    const blog = await this.blogsRepository.findBlog(id);

    if (!blog) {
      return null;
    }

    await blog.updateBlog(updateBlogDto);
    return this.blogsRepository.save(blog);
  }

  async deleteBlog(id: string): Promise<boolean | null> {
    const blog = await this.blogsRepository.findBlog(id);

    if (!blog) {
      return null;
    }

    return this.blogsRepository.deleteBlog(id);
  }
}
