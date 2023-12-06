import { IsIn } from 'class-validator';

import { LikeStatus } from '../../../shared/enums/like-status.enum';

export abstract class LikeStatusInputDTO {
  @IsIn([LikeStatus.NONE, LikeStatus.LIKE, LikeStatus.DISLIKE])
  likeStatus: string;
}
