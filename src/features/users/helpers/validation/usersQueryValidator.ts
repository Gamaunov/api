import { UserQuery } from '../../dto/user.query';
import { SortDirection } from '../../../../shared/enums/sort-direction.enum';
import { SortUserFields } from '../enums/sortUserFields';

function validateSortBy(sortBy: any): string {
  if (Object.values(SortUserFields).includes(sortBy)) {
    return sortBy;
  } else {
    return SortUserFields.createdAt;
  }
}

function validateNumber(n: any, def: number): number {
  if (typeof n === 'number' && Number.isInteger(n) && n >= 1) {
    return n;
  } else {
    return def;
  }
}

function validateTerm(term: any): string | null {
  if (typeof term === 'string' && term.trim().length > 0) {
    return term.trim();
  }

  return null;
}

export function usersQueryValidator(query: any): UserQuery {
  query.sortBy = validateSortBy(query.sortBy);
  query.sortDirection =
    query.sortDirection === SortDirection.ASC
      ? SortDirection.ASC
      : SortDirection.DESC;
  query.pageNumber = validateNumber(+query.pageNumber, 1);
  query.pageSize = validateNumber(+query.pageSize, 10);
  query.searchLoginTerm = validateTerm(query.searchLoginTerm);
  query.searchEmailTerm = validateTerm(query.searchEmailTerm);

  return query;
}
