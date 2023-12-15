import { applyDecorators } from '@nestjs/common';
import { IsEmail, IsOptional } from 'class-validator';

import { Trim } from './trim.decorator';

export const IsOptionalEmail = () =>
  applyDecorators(IsEmail(), Trim(), IsOptional());
