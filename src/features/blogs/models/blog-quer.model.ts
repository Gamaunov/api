import { IsOptional } from 'class-validator';

import { QueryModel } from '../../../base/models/query.model';

export class BlogQueryModel extends QueryModel {
  @IsOptional()
  searchNameTerm: string;
}
