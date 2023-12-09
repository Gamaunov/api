import { IsIn } from 'class-validator';

import { LikeStatus } from '../../../base/enums/like-status.enum';

export class LikeStatusInputModel {
  @IsIn([LikeStatus.NONE, LikeStatus.LIKE, LikeStatus.DISLIKE])
  likeStatus: string;
}
