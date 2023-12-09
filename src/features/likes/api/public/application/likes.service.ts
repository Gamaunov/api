import { Injectable } from '@nestjs/common';

import { LikesDataType } from '../../../schemas/likes-data.type';
import { LikeStatus } from '../../../../../base/enums/like-status.enum';
import { UsersRepository } from '../../../../users/infrastructure/users.repository';
import { LikesRepository } from '../../../infrastructure/likes.repository';

@Injectable()
export class LikesService {
  constructor(
    private readonly likesRepository: LikesRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async updateLikesData(data: LikesDataType): Promise<boolean | null> {
    const userInLikesInfo = await this.likesRepository.findUserInLikesInfo(
      data,
    );

    if (!userInLikesInfo) {
      const user = await this.usersRepository.findUserById(data.userId);
      const userLogin = user.accountData.login;

      await this.likesRepository.pushUserInLikesInfo(data, userLogin);

      if (data.likeStatus === LikeStatus.LIKE) {
        data.likesCount++;
      }

      if (data.likeStatus === LikeStatus.DISLIKE) {
        data.dislikesCount++;
      }

      return this.likesRepository.updateLikesCount(data);
    }

    const userLikeStatus = await this.likesRepository.findUserLikeStatus(data);

    switch (userLikeStatus) {
      case LikeStatus.NONE:
        if (data.likeStatus === LikeStatus.LIKE) {
          data.likesCount++;
        }

        if (data.likeStatus === LikeStatus.DISLIKE) {
          data.dislikesCount++;
        }
        break;

      case LikeStatus.LIKE:
        if (data.likeStatus === LikeStatus.NONE) {
          data.likesCount--;
        }

        if (data.likeStatus === LikeStatus.DISLIKE) {
          data.likesCount--;
          data.dislikesCount++;
        }
        break;

      case LikeStatus.DISLIKE:
        if (data.likeStatus === LikeStatus.NONE) {
          data.dislikesCount--;
        }

        if (data.likeStatus === LikeStatus.LIKE) {
          data.dislikesCount--;
          data.likesCount++;
        }
    }

    await this.likesRepository.updateLikesCount(data);
    return this.likesRepository.updateLikesStatus(data);
  }
}
