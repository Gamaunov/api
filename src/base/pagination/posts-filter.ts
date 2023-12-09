import { FilterQuery } from 'mongoose';

import { BlogDocument } from '../../features/blogs/domain/blog.entity';

export const postsFilter = (blogId: string) => {
  const filter: FilterQuery<BlogDocument> = {};

  if (blogId) {
    filter.blogId = blogId;
  }

  return filter;
};
