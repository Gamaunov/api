import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { LikeStatusInputModel } from '../../../../models/like-status-input.model';
import { Post, PostModelType } from '../../../../../posts/domain/post.entity';
import { LikesService } from '../likes.service';
import { LikesDataType } from '../../../../schemas/likes-data.type';
import { PostsRepository } from '../../../../../posts/infrastructure/posts.repository';

export class LikeUpdateForPostCommand {
  constructor(
    public likeStatusInputDto: LikeStatusInputModel,
    public postId: string,
    public userId: string,
  ) {}
}

@CommandHandler(LikeUpdateForPostCommand)
export class LikeUpdateForPostUseCase
  implements ICommandHandler<LikeUpdateForPostCommand>
{
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private readonly postsRepository: PostsRepository,
    private readonly likesService: LikesService,
  ) {}

  async execute(command: LikeUpdateForPostCommand): Promise<boolean | null> {
    const post = await this.postsRepository.findPostById(command.postId);

    if (!post) {
      return null;
    }

    const data: LikesDataType = {
      commentOrPostId: command.postId,
      userId: command.userId,
      likeStatus: command.likeStatusInputDto.likeStatus,
      likesCount: post.likesInfo.likesCount,
      dislikesCount: post.likesInfo.dislikesCount,
      model: this.PostModel,
    };

    return this.likesService.updateLikesData(data);
  }
}
