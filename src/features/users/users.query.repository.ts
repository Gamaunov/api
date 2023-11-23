import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Paginator } from '../../shared/genericTypes/paginator';

import { User, UserModelType } from './schemas/user.entity';
import { UserQuery } from './dto/user.query';
import { UserView } from './schemas/user.view';
import { usersQueryValidator } from './helpers/validation/usersQueryValidator';
import { loginEmailFilter } from './helpers/filters/loginEmailFilter';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}
  async findUsers(queryData: UserQuery): Promise<Paginator<UserView[]>> {
    const query = usersQueryValidator(queryData);

    const filter = loginEmailFilter(
      query.searchLoginTerm,
      query.searchEmailTerm,
    );

    const sortCriteria: { [key: string]: any } = {
      [query.sortBy as string]: query.sortDirection,
    };
    console.log(sortCriteria);
    const users = await this.UserModel.find(filter)
      .skip((+query.pageNumber - 1) * +query.pageSize)
      .limit(+query.pageSize)
      .sort(sortCriteria)
      .lean();

    const totalCount = await this.UserModel.countDocuments(filter);

    return {
      pagesCount: Math.ceil(totalCount / +query.pageSize),
      page: +query.pageNumber,
      pageSize: +query.pageSize,
      totalCount,
      items: users.map((user) => {
        return {
          id: user._id.toString(),
          login: user.accountData.login,
          email: user.accountData.email,
          createdAt: user.accountData.createdAt.toISOString(),
        };
      }),
    };
  }
}
