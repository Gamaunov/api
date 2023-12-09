import { FilterQuery } from 'mongoose';

import { BlogDocument } from '../../features/blogs/domain/blog.entity';

export const commentsFilter = (postId: string) => {
  const filter: FilterQuery<BlogDocument> = {};

  if (postId) {
    filter.postId = postId;
  }

  return filter;
};
