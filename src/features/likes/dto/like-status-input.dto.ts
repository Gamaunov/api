import { IsIn } from 'class-validator';

import { LikeStatus } from '@/shared/enums/like-status.enum';

export class LikeStatusInputDTO {
  @IsIn([LikeStatus.NONE, LikeStatus.LIKE, LikeStatus.DISLIKE])
  likeStatus: string;
}
