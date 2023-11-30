import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { jwtConstants } from '../config/constants';
import { bearerType } from '../../../shared/constants/constants';

@Injectable()
export class JwtBearerStrategy extends PassportStrategy(Strategy, bearerType) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.accessTokenSecret,
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
    };
  }
}
