import { LikeStatus } from '../../../shared/enums/like-status.enum';
import { CommentDTOType } from '../../comments/comment.entity';
import { PostLeanType } from '../../posts/post.entity';
import { UsersLikesSchema } from '../schemas/likes-users.schema';

export const getLikeStatus = (
  data: CommentDTOType | PostLeanType,
  userId: string,
) => {
  const users: UsersLikesSchema[] = data.likesInfo.users;
  const user: UsersLikesSchema = users.find((user) => user.userId === userId);

  return user ? user.likeStatus : LikeStatus.NONE;
};
