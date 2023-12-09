import { IsOptional } from 'class-validator';

import { QueryModel } from '../../../../base/models/query.model';

export class UserQueryModel extends QueryModel {
  @IsOptional()
  searchLoginTerm: string;
  @IsOptional()
  searchEmailTerm: string;
}
