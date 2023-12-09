import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { QueryModel } from '../../../../base/models/query.model';

export class UserQueryModel extends QueryModel {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  searchLoginTerm: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  searchEmailTerm: string;
}
