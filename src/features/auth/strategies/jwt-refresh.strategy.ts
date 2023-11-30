import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { jwtConstants } from '../config/constants';
import { refreshType } from '../../../shared/constants/constants';
import { cookieExtractor } from '../../../shared/utils/cookie-extractor';
import { ValidateRefreshTokenCommand } from '../api/public/application/use-cases/validations/validate-refresh-token.use-case';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  refreshType,
) {
  constructor(private commandBus: CommandBus) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: jwtConstants.refreshTokenSecret,
    });
  }

  async validate(payload: any) {
    const result = await this.commandBus.execute(
      new ValidateRefreshTokenCommand(payload),
    );

    if (!result) {
      throw new UnauthorizedException();
    }

    return {
      id: payload.sub,
    };
  }
}
