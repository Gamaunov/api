import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { basicType } from '../../../base/constants/constants';

@Injectable()
export class BasicAuthGuard extends AuthGuard(basicType) {}
