import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { localType } from '../../../base/constants/constants';

@Injectable()
export class LocalAuthGuard extends AuthGuard(localType) {}
