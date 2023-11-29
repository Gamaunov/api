import { IsOptional } from 'class-validator';

import { QueryDTO } from '@/shared/dto/query.dto';

export class BlogQuery extends QueryDTO {
  @IsOptional()
  searchNameTerm: string;
}
