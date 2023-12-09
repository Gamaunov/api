import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';

import { BlogInputModel } from '../../../../models/blog-input.model';
import { Blog, BlogModelType } from '../../../../domain/blog.entity';
import { BlogsRepository } from '../../../../infrastructure/blogs.repository';

export class BlogCreateCommand {
  constructor(public blogInputModel: BlogInputModel) {}
}

@CommandHandler(BlogCreateCommand)
export class BlogCreateUseCase implements ICommandHandler<BlogCreateCommand> {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute(command: BlogCreateCommand): Promise<string | null> {
    const blog = this.BlogModel.createBlog(
      this.BlogModel,
      command.blogInputModel,
    );
    await this.blogsRepository.save(blog);
    return blog.id;
  }
}
