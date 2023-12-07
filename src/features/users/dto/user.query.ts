import { IsOptional } from 'class-validator';

import { QueryDTO } from '../../../shared/dto/query.dto';

export class UserQuery extends QueryDTO {
  @IsOptional()
  searchLoginTerm: string;
  @IsOptional()
  searchEmailTerm: string;
}
