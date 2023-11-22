import { CommentDTOType } from '../../features/comments/schemas/comment.entity';
import { PostDTOType } from '../../features/posts/schemas/post.entity';
import { LikeStatus } from '../enums/like-status.enum';

export const getLikeStatus = (
  data: CommentDTOType | PostDTOType,
  userId: string,
) => {
  const users = data.likesInfo.users;
  const user = users.find((user) => user.userId === userId);

  return user ? user.likeStatus : LikeStatus.NONE;
};
