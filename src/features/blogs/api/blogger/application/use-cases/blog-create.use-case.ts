import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';

import { BlogInputDTO } from '../../../../dto/blog-input.dto';
import { Blog, BlogModelType } from '../../../../blog.entity';
import { BlogsRepository } from '../../../../infrastructure/blogs.repository';
import { UsersRepository } from '../../../../../users/infrastructure/users.repository';

export class BlogCreateCommand {
  constructor(public blogInputDTO: BlogInputDTO, public userId: string) {}
}

@CommandHandler(BlogCreateCommand)
export class BlogCreateUseCase implements ICommandHandler<BlogCreateCommand> {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    private readonly blogsRepository: BlogsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: BlogCreateCommand): Promise<string | null> {
    const user = await this.usersRepository.findUserById(command.userId);

    if (!user) {
      return null;
    }

    const blog = this.BlogModel.createBlog(
      this.BlogModel,
      command.blogInputDTO,
      user,
    );
    await this.blogsRepository.save(blog);
    return blog.id;
  }
}
