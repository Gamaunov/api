import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { refreshType } from '@/shared/constants/constants';

@Injectable()
export class JwtRefreshGuard extends AuthGuard(refreshType) {}
