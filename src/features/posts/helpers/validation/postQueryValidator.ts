import { SortPostFields } from '../enums/sortPostFields';
import { SortDirection } from '../../../../shared/enums/sort-direction.enum';

function validateSortBy(sortBy: any): string {
  if (Object.values(SortPostFields).includes(sortBy)) {
    return sortBy;
  } else {
    return SortPostFields.createdAt;
  }
}

function validateNumber(n: any, def: number): number {
  if (typeof n === 'number' && Number.isInteger(n) && n >= 1) {
    return n;
  } else {
    return def;
  }
}
export function postQueryValidator(query: any) {
  query.pageNumber = validateNumber(+query.pageNumber, 1);
  query.pageSize = validateNumber(+query.pageSize, 10);
  query.sortBy = validateSortBy(query.sortBy);
  query.sortDirection = query.sortDirection === SortDirection.ASC ? 1 : -1;

  return query;
}
