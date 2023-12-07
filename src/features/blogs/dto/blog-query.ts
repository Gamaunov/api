import { IsOptional } from 'class-validator';

import { QueryDto } from '../../../shared/dto/queryDto';

export abstract class BlogQuery extends QueryDto {
  @IsOptional()
  searchNameTerm: string;
}
