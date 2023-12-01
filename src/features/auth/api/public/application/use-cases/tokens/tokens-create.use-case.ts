import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

import { jwtConstants } from '../../../../../config/constants';

export class TokensCreateCommand {
  constructor(public userId: string, public deviceId = randomUUID()) {}
}

@CommandHandler(TokensCreateCommand)
export class TokensCreateUseCase
  implements ICommandHandler<TokensCreateCommand>
{
  constructor(private readonly jwtService: JwtService) {}

  async execute(command: TokensCreateCommand) {
    const accessTokenPayload: object = { sub: command.userId };
    const refreshTokenPayload: object = {
      sub: command.userId,
      deviceId: command.deviceId,
    };

    const accessToken = this.jwtService.sign(accessTokenPayload as object, {
      secret: jwtConstants.accessTokenSecret as string,
      expiresIn: jwtConstants.accessTokenExpirationTime as string,
    });

    const refreshToken = this.jwtService.sign(refreshTokenPayload as object, {
      secret: jwtConstants.refreshTokenSecret as string,
      expiresIn: jwtConstants.refreshTokenExpirationTime as string,
    });

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }
}
