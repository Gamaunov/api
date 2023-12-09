import { FilterQuery } from 'mongoose';

import { BlogDocument } from '../../features/blogs/domain/blog.entity';

export const usersFilter = (login: string, email: string) => {
  const filter: FilterQuery<BlogDocument> = {};

  if (login || email) {
    filter.$or = [];

    if (login) {
      filter.$or.push({
        'accountData.login': { $regex: login, $options: 'i' },
      });
    }

    if (email) {
      filter.$or.push({
        'accountData.email': { $regex: email, $options: 'i' },
      });
    }
  }

  return filter;
};
