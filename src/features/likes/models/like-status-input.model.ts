import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

import { LikeStatus } from '../../../base/enums/like-status.enum';

export class LikeStatusInputModel {
  @ApiProperty({ enum: LikeStatus, default: LikeStatus.NONE })
  @IsIn([LikeStatus.NONE, LikeStatus.LIKE, LikeStatus.DISLIKE])
  likeStatus: string;
}
