import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostInputDTO } from '../../../../dto/post-input.dto';
import { Post, PostModelType } from '../../../../post.entity';
import { BlogsRepository } from '../../../../../blogs/infrastructure/blogs.repository';
import { ResultCode } from '../../../../../../shared/enums/result-code.enum';
import {
  blogIDField,
  blogNotFound,
  userIDField,
  userNotFound,
} from '../../../../../../shared/constants/constants';
import { PostsRepository } from '../../../../infrastructure/posts.repository';
import { UsersRepository } from '../../../../../users/infrastructure/users.repository';

export class PostCreateCommand {
  constructor(
    public postInputDTO: PostInputDTO,
    public blogId: string,
    public userId: string,
  ) {}
}

@CommandHandler(PostCreateCommand)
export class PostCreateUseCase implements ICommandHandler<PostCreateCommand> {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: PostCreateCommand) {
    const blog = await this.blogsRepository.findBlogById(command.blogId);

    if (!blog) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: blogIDField,
        message: blogNotFound,
      };
    }

    const user = await this.usersRepository.findUserById(command.userId);

    if (!user) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: userIDField,
        message: userNotFound,
      };
    }

    const post = this.PostModel.createPost(
      this.PostModel,
      command.postInputDTO,
      blog,
    );

    await this.postsRepository.save(post);

    return {
      data: true,
      code: ResultCode.Success,
      response: post.id,
    };
  }
}
