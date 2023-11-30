import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import { noJwtGuardFound } from '../../../shared/constants/constants';

export const RefreshToken = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (!request.cookies.refreshToken) {
      throw new UnauthorizedException(noJwtGuardFound);
    }
    return request.cookies.refreshToken;
  },
);
