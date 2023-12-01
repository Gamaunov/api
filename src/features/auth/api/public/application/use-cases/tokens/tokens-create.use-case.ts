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
    const accessToken = this.jwtService.sign(
      { sub: command.userId },
      {
        secret: jwtConstants.accessTokenSecret,
        expiresIn: jwtConstants.accessTokenExpirationTime,
      },
    );

    const refreshToken = this.jwtService.sign(
      {
        sub: command.userId,
        deviceId: command.deviceId,
      },
      {
        secret: jwtConstants.refreshTokenSecret as string,
        expiresIn: jwtConstants.refreshTokenExpirationTime as string,
      },
    );

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }
}
