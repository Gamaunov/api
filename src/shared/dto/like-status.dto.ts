import { IsIn } from 'class-validator';

import { LikeStatus } from '../enums/like-status.enum';

export class LikeStatusDTO {
  @IsIn([LikeStatus.NONE, LikeStatus.LIKE, LikeStatus.DISLIKE])
  likeStatus: string;
}
