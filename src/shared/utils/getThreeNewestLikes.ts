import { LikeStatus } from '../enums/like-status.enum';
import { UsersLikesSchema } from '../../features/likes/schemas/likes-users.schema';

type ThreeNewestLikesType = {
  addedAt: string;
  userId: string;
  login: string;
};

export function getThreeNewestLikes(
  likesArray: UsersLikesSchema[],
): ThreeNewestLikesType[] {
  return likesArray
    .filter((p: UsersLikesSchema): boolean => p.likeStatus === LikeStatus.LIKE)
    .sort(
      (a: UsersLikesSchema, b: UsersLikesSchema) =>
        -a.addedAt.toISOString().localeCompare(b.addedAt.toISOString()),
    )
    .map((p: UsersLikesSchema) => {
      return {
        addedAt: p.addedAt.toISOString(),
        userId: p.userId,
        login: p.userLogin,
      };
    })
    .splice(0, 3);
}
