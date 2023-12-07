import { IsOptional } from 'class-validator';

import { QueryDto } from '../../../shared/dto/queryDto';

export abstract class UserQuery extends QueryDto {
  @IsOptional()
  searchLoginTerm: string;
  @IsOptional()
  searchEmailTerm: string;
}
