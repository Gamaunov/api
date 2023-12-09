import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { QueryModel } from '../../../base/models/query.model';

export class BlogQueryModel extends QueryModel {
  @ApiProperty({ required: false })
  @IsOptional()
  searchNameTerm: string;
}
