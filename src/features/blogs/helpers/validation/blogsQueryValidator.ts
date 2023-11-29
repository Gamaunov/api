import { SortBlogFields } from '../enums/sortBlogFields';

import { SortDirection } from '@/shared/enums/sort-direction.enum';

function validateSortBy(sortBy: any): string {
  if (Object.values(SortBlogFields).includes(sortBy)) {
    return sortBy;
  } else {
    return SortBlogFields.createdAt;
  }
}

function validateNumber(n: any, def: number): number {
  if (typeof n === 'number' && Number.isInteger(n) && n >= 1) {
    return n;
  } else {
    return def;
  }
}
export function blogsQueryValidator(query: any) {
  query.searchNameTerm =
    typeof query.searchNameTerm === 'string' &&
    query.searchNameTerm.trim().length > 0
      ? query.searchNameTerm.trim()
      : null;

  query.sortBy = validateSortBy(query.sortBy);
  query.sortDirection = query.sortDirection === SortDirection.ASC ? 1 : -1;

  query.pageNumber = validateNumber(+query.pageNumber, 1);
  query.pageSize = validateNumber(+query.pageSize, 10);

  return query;
}
