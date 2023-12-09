import { IsOptional } from 'class-validator';

import { QueryParamsEnum } from '../enums/query-params.enum';
import { SortDirection } from '../enums/sort-direction.enum';

export class QueryModel {
  @IsOptional()
  sortBy = QueryParamsEnum.createdAt;
  @IsOptional()
  sortDirection: SortDirection.DESC | SortDirection.ASC = SortDirection.DESC;
  @IsOptional()
  pageNumber = 1;
  @IsOptional()
  pageSize = 10;
}
