import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { bearerType } from '../../../base/constants/constants';

@Injectable()
export class JwtBearerGuard extends AuthGuard(bearerType) {}
