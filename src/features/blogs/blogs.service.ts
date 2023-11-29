import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Blog, BlogModelType } from './schemas/blog.entity';
import { BlogsRepository } from './blogs.repository';
import { BlogInputDTO } from './dto/blog-input.dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async createBlog(createBlogDTO: BlogInputDTO): Promise<string | null> {
    const blog = this.BlogModel.createBlog(createBlogDTO, this.BlogModel);
    await this.blogsRepository.save(blog);
    return blog.id;
  }

  async updateBlog(
    id: string,
    updateBlogDto: BlogInputDTO,
  ): Promise<Blog | null> {
    const blog = await this.blogsRepository.findBlogById(id);

    if (!blog) {
      return null;
    }

    await blog.updateBlog(updateBlogDto);
    return this.blogsRepository.save(blog);
  }

  async deleteBlog(id: string): Promise<boolean | null> {
    const blog = await this.blogsRepository.findBlogById(id);

    if (!blog) {
      return null;
    }

    return this.blogsRepository.deleteBlog(id);
  }

  async deleteAllBlogs(): Promise<boolean> {
    return this.blogsRepository.deleteAllBlogs();
  }
}
