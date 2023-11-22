import { LikeStatus } from '../enums/like-status.enum';
import { UsersLikesSchema } from '../schemas/users-likes.schema';

type ThreeNewestLikesType = {
  addedAt: string;
  userId: string;
  login: string;
};

export function getThreeNewestLikes(
  likesArray: UsersLikesSchema[],
): ThreeNewestLikesType[] {
  return likesArray
    .filter((p) => p.likeStatus === LikeStatus.LIKE)
    .sort(
      (a, b) => -a.addedAt.toISOString().localeCompare(b.addedAt.toISOString()),
    )
    .map((p) => {
      return {
        addedAt: p.addedAt.toISOString(),
        userId: p.userId,
        login: p.userLogin,
      };
    })
    .splice(0, 3);
}
