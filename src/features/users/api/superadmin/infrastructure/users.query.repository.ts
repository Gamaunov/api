import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { User, UserLeanType, UserModelType } from '../../../user.entity';
import { UserQuery } from '../../../dto/user.query';
import { Paginator } from '../../../../../shared/pagination/_paginator';
import { SuperAdminUserViewDto } from '../dto/sa.user-view.dto';
import { paginateFeature } from '../../../../../shared/pagination/paginate-feature';
import { usersFilter } from '../../../../../shared/pagination/users-filter';
import { sortDirection } from '../../../../../shared/pagination/sort-direction';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}
  async findUsers(
    query: UserQuery,
  ): Promise<Paginator<SuperAdminUserViewDto[]>> {
    const users = await paginateFeature(
      this.UserModel,
      query.pageNumber,
      query.pageSize,
      usersFilter(query.searchLoginTerm, query.searchEmailTerm),
      sortDirection(`accountData.${query.sortBy}`, query.sortDirection),
    );

    const totalCount = await this.UserModel.countDocuments(
      usersFilter(query.searchLoginTerm, query.searchEmailTerm),
    );

    return Paginator.paginate({
      pageNumber: +query.pageNumber,
      pageSize: +query.pageSize,
      totalCount: totalCount,
      items: await this.usersMapping(users),
    });
  }

  async findUser(id: string): Promise<SuperAdminUserViewDto | null> {
    if (!mongoose.isValidObjectId(id)) {
      return null;
    }

    const user = await this.UserModel.findOne({ _id: id });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      login: user.accountData.login,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt,
    };
  }

  private async usersMapping(
    users: UserLeanType[],
  ): Promise<SuperAdminUserViewDto[]> {
    return users.map((u) => {
      return {
        id: u._id.toString(),
        login: u.accountData.login,
        email: u.accountData.email,
        createdAt: u.accountData.createdAt,
      };
    });
  }
}
