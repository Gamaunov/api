import { IsOptional } from 'class-validator';

import { QueryParamsEnum } from '../enums/query-params.enum';
import { SortDirection } from '../enums/sort-direction.enum';

export class QueryDTO {
  @IsOptional()
  sortBy = QueryParamsEnum.createdAt;
  @IsOptional()
  sortDirection: SortDirection.DESC | SortDirection.ASC = SortDirection.DESC;
  @IsOptional()
  pageNumber: number = 1;
  @IsOptional()
  pageSize: number = 10;
}
