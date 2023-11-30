import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Ip,
  Post,
  Response,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CommandBus } from '@nestjs/cqrs';

import { UserInputDTO } from '../../../users/dto/user-input-dto';
import { exceptionHandler } from '../../../../shared/exceptions/exception.handler';
import { ResultCode } from '../../../../shared/enums/result-code.enum';
import {
  confirmCodeField,
  confirmCodeIsIncorrect,
  emailField,
  recoveryCodeField,
  recoveryCodeIsIncorrect,
  refreshToken_,
  unknown_,
  userAgent_,
  userIDField,
  userNotFound,
  userNotFoundOrConfirmed,
} from '../../../../shared/constants/constants';
import { ConfirmCodeInputDTO } from '../../dto/user-confirm.dto';
import { LocalAuthGuard } from '../../guards/local-auth.guard';
import { UserIdFromGuard } from '../../decorators/user-id-from-guard.param.decorator';
import { JwtRefreshGuard } from '../../guards/jwt-refresh.guard';
import { RefreshToken } from '../../decorators/refresh-token.param.decorator';
import { JwtBearerGuard } from '../../guards/jwt-bearer.guard';
import { EmailInputDTO } from '../../dto/email-input.dto';
import { NewPasswordDTO } from '../../dto/new-password.dto';
import { DeviceCreateForLoginCommand } from '../../../devices/api/public/application/use-cases/device-create-for-login.use-case';
import { DeviceUpdateForTokensCommand } from '../../../devices/api/public/application/use-cases/device-update-for-tokens.use-case';
import { DeviceDeleteForLogoutCommand } from '../../../devices/api/public/application/use-cases/device-delete-for-logout.use-case';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

import { TokensCreateCommand } from './application/use-cases/tokens/tokens-create.use-case';
import { PasswordUpdateCommand } from './application/use-cases/password/password-update.use-case';
import { PasswordRecoveryCommand } from './application/use-cases/password/password-recovery.use-case';
import { RegistrationEmailResendCommand } from './application/use-cases/registration/registration-email-resend.use-case';
import { RegistrationCommand } from './application/use-cases/registration/registration.use-case';
import { RegistrationConfirmationCommand } from './application/use-cases/registration/registration-confirmation.use-case';

@Controller('auth')
export class PublicAuthController {
  constructor(
    private commandBus: CommandBus,
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
  ) {}
  @UseGuards(JwtBearerGuard)
  @Get('me')
  async getProfile(@UserIdFromGuard() userId: string) {
    const user = await this.usersRepository.findUserById(userId);

    if (!user) {
      return exceptionHandler(ResultCode.NotFound, userNotFound, userIDField);
    }

    return {
      email: user?.accountData.email,
      login: user?.accountData.login,
      id: userId,
    };
  }
  @UseGuards(ThrottlerGuard)
  @Throttle(5, 10)
  @Post('registration')
  @HttpCode(204)
  async registerUser(@Body() userInputDTO: UserInputDTO) {
    return this.commandBus.execute(new RegistrationCommand(userInputDTO));
  }
  @UseGuards(ThrottlerGuard)
  @Throttle(5, 10)
  @Post('registration-email-resending')
  @HttpCode(204)
  async resendEmail(@Body() emailInputDTO: EmailInputDTO) {
    const result = await this.commandBus.execute(
      new RegistrationEmailResendCommand(emailInputDTO),
    );

    if (!result) {
      return exceptionHandler(
        ResultCode.BadRequest,
        userNotFoundOrConfirmed,
        emailField,
      );
    }

    return result;
  }
  @UseGuards(ThrottlerGuard)
  @Throttle(5, 10)
  @Post('registration-confirmation')
  @HttpCode(204)
  async confirmUser(@Body() confirmCodeInputDTO: ConfirmCodeInputDTO) {
    const result = await this.commandBus.execute(
      new RegistrationConfirmationCommand(confirmCodeInputDTO),
    );

    if (!result) {
      return exceptionHandler(
        ResultCode.BadRequest,
        confirmCodeIsIncorrect,
        confirmCodeField,
      );
    }

    return result;
  }
  @UseGuards(ThrottlerGuard)
  @Throttle(5, 10)
  @Post('password-recovery')
  @HttpCode(204)
  async recoverPassword(@Body() emailInputDTO: EmailInputDTO) {
    return this.commandBus.execute(new PasswordRecoveryCommand(emailInputDTO));
  }
  @UseGuards(ThrottlerGuard)
  @Throttle(5, 10)
  @Post('new-password')
  @HttpCode(204)
  async updatePassword(@Body() newPasswordDTO: NewPasswordDTO) {
    const result = await this.commandBus.execute(
      new PasswordUpdateCommand(newPasswordDTO),
    );

    if (!result) {
      return exceptionHandler(
        ResultCode.BadRequest,
        recoveryCodeIsIncorrect,
        recoveryCodeField,
      );
    }

    return result;
  }
  @UseGuards(ThrottlerGuard, LocalAuthGuard)
  @Throttle(5, 10)
  @Post('login')
  @HttpCode(200)
  async login(
    @UserIdFromGuard() userId: string,
    @Ip() ip: string,
    @Headers() headers: string,
    @Response() res,
  ) {
    const userAgent = headers[userAgent_] || unknown_;
    const tokens = await this.commandBus.execute(
      new TokensCreateCommand(userId),
    );

    await this.commandBus.execute(
      new DeviceCreateForLoginCommand(tokens.refreshToken, ip, userAgent),
    );

    res
      .cookie(refreshToken_, tokens.refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .json({ accessToken: tokens.accessToken });
  }
  @UseGuards(JwtRefreshGuard)
  @Post('refresh-token')
  @HttpCode(200)
  async refreshTokens(
    @UserIdFromGuard() userId: string,
    @Ip() ip: string,
    @Headers() headers: string,
    @RefreshToken() refreshToken: string,
    @Response() res,
  ): Promise<void> {
    const userAgent = headers[userAgent_] || unknown_;
    const decodedToken: any = this.jwtService.decode(refreshToken);
    const deviceId = decodedToken.deviceId;
    const tokens = await this.commandBus.execute(
      new TokensCreateCommand(userId, deviceId),
    );
    const newToken = this.jwtService.decode(tokens.refreshToken);

    await this.commandBus.execute(
      new DeviceUpdateForTokensCommand(newToken, ip, userAgent),
    );

    res
      .cookie(refreshToken_, tokens.refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .json({ accessToken: tokens.accessToken });
  }
  @UseGuards(JwtRefreshGuard)
  @Post('logout')
  @HttpCode(204)
  async logout(@RefreshToken() refreshToken: string): Promise<boolean> {
    const decodedToken: any = this.jwtService.decode(refreshToken);
    const deviceId = decodedToken.deviceId;
    return this.commandBus.execute(new DeviceDeleteForLogoutCommand(deviceId));
  }
}
