import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CommentInputDto } from '../../../../dto/comment-input.dto';
import { Comment, CommentModelType } from '../../../../comment.entity';
import { CommentsRepository } from '../../../../infrastructure/comments.repository';
import { PostsRepository } from '../../../../../posts/infrastructure/posts.repository';
import { UsersRepository } from '../../../../../users/infrastructure/users.repository';

export class CommentCreateCommand {
  constructor(
    public commentInputDto: CommentInputDto,
    public postId: string,
    public userId: string,
  ) {}
}

@CommandHandler(CommentCreateCommand)
export class CommentCreateUseCase
  implements ICommandHandler<CommentCreateCommand>
{
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    private readonly commentsRepository: CommentsRepository,
    private readonly postsRepository: PostsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: CommentCreateCommand): Promise<string | null> {
    const post = await this.postsRepository.findPostById(command.postId);

    if (!post) {
      return null;
    }

    const user = await this.usersRepository.findUserById(command.userId);

    const comment = this.CommentModel.createComment(
      this.CommentModel,
      command.commentInputDto,
      post,
      user,
    );
    await this.commentsRepository.save(comment);
    return comment.id;
  }
}
