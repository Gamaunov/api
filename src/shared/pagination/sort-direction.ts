import { SortOrder } from 'mongoose';

import { SortDirection } from '../enums/sort-direction.enum';

export const sortDirection = (sortBy: string, sortDirection: SortOrder) => {
  const result = {
    [sortBy]: sortDirection,
  };

  if (sortDirection === SortDirection.ASC) {
    result[sortBy] = SortDirection.DESC;
  }

  return result;
};
