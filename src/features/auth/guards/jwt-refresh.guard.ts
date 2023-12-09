import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { refreshType } from '../../../base/constants/constants';

@Injectable()
export class JwtRefreshGuard extends AuthGuard(refreshType) {}
