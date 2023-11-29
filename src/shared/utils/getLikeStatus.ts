import { LikeStatus } from '../enums/like-status.enum';

import { CommentDTOType } from '@/features/comments/schemas/comment.entity';
import { PostDTOType } from '@/features/posts/schemas/post.entity';
import { UsersLikesSchema } from '@/features/likes/schemas/likes-users.schema';

export const getLikeStatus = (
  data: CommentDTOType | PostDTOType,
  userId: string,
) => {
  const users: UsersLikesSchema[] = data.likesInfo.users;
  const user: UsersLikesSchema = users.find((user) => user.userId === userId);

  return user ? user.likeStatus : LikeStatus.NONE;
};
