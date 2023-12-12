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
import { ApiBasicAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { UserInputModel } from '../../../users/api/models/user-input-model';
import { exceptionHandler } from '../../../../infrastructure/exception-filters/exception.handler';
import { ResultCode } from '../../../../base/enums/result-code.enum';
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
} from '../../../../base/constants/constants';
import { ConfirmCodeInputModel } from '../../models/user-confirm.model';
import { UserIdFromGuard } from '../../decorators/user-id-from-guard.guard.decorator';
import { JwtRefreshGuard } from '../../guards/jwt-refresh.guard';
import { RefreshToken } from '../../decorators/refresh-token.param.decorator';
import { JwtBearerGuard } from '../../guards/jwt-bearer.guard';
import { EmailInputModel } from '../../models/email-input.model';
import { NewPasswordModel } from '../../models/new-password.model';
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
import { AuthService } from './application/use-cases/auth.service';

@ApiTags('auth')
@Controller('auth')
export class PublicAuthController {
  constructor(
    private commandBus: CommandBus,
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
    private readonly authService: AuthService,
  ) {}
  @Get('me')
  @ApiOperation({ summary: 'Get information about current user' })
  @ApiBasicAuth('Bearer')
  @UseGuards(JwtBearerGuard)
  async getProfile(@UserIdFromGuard() userId: string) {
    const user = await this.usersRepository.findUserById(userId);

    if (!user) {
      return exceptionHandler(ResultCode.NotFound, userNotFound, userIDField);
    }

    return {
      email: user?.accountData.email,
      login: user?.accountData.login,
      userId,
    };
  }

  @Post('registration')
  @ApiOperation({
    summary:
      'Registration in the system. Email with confirmation code will be send to passed email address',
  })
  @UseGuards(ThrottlerGuard)
  @Throttle(5, 10)
  @HttpCode(204)
  async registerUser(@Body() userInputModel: UserInputModel) {
    return this.commandBus.execute(new RegistrationCommand(userInputModel));
  }

  @Post('registration-email-resending')
  @ApiOperation({
    summary: 'Resend confirmation registration Email if user exists',
  })
  @UseGuards(ThrottlerGuard)
  @Throttle(5, 10)
  @HttpCode(204)
  async resendEmail(@Body() emailInputModel: EmailInputModel) {
    const result = await this.commandBus.execute(
      new RegistrationEmailResendCommand(emailInputModel),
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

  @Post('registration-confirmation')
  @ApiOperation({ summary: 'Confirm registration' })
  @UseGuards(ThrottlerGuard)
  @Throttle(5, 10)
  @HttpCode(204)
  async confirmUser(@Body() confirmCodeInputModel: ConfirmCodeInputModel) {
    const result = await this.commandBus.execute(
      new RegistrationConfirmationCommand(confirmCodeInputModel),
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

  @Post('password-recovery')
  @ApiOperation({
    summary:
      'Password recovery via Email confirmation. Email should be sent with RecoveryCode inside',
  })
  @UseGuards(ThrottlerGuard)
  @Throttle(5, 10)
  @HttpCode(204)
  async recoverPassword(@Body() emailInputModel: EmailInputModel) {
    return this.commandBus.execute(
      new PasswordRecoveryCommand(emailInputModel),
    );
  }

  @Post('new-password')
  @ApiOperation({
    summary: 'Confirm Password recovery',
  })
  @UseGuards(ThrottlerGuard)
  @Throttle(5, 10)
  @HttpCode(204)
  async updatePassword(@Body() newPasswordModel: NewPasswordModel) {
    const result = await this.commandBus.execute(
      new PasswordUpdateCommand(newPasswordModel),
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

  @Post('login')
  @ApiOperation({
    summary: 'Try login user to the system',
  })
  @UseGuards(ThrottlerGuard)
  @Throttle(5, 10)
  @HttpCode(200)
  async login(
    @Ip() ip: string,
    @Body() body,
    @Headers() headers: string,
    @Response() res,
  ) {
    const userId = await this.authService.checkCredentials(
      body.loginOrEmail,
      body.password,
    );

    if (!userId) {
      res.sendStatus(401);
      return;
    }

    const userAgent = headers['user-agent'] || 'unknown';
    const tokens = await this.commandBus.execute(
      new TokensCreateCommand(userId),
    );

    await this.commandBus.execute(
      new DeviceCreateForLoginCommand(tokens.refreshToken, ip, userAgent),
    );

    res
      .cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .json({ accessToken: tokens.accessToken });
  }

  @Post('refresh-token')
  @ApiOperation({
    summary:
      'Generate new pair of access and refresh tokens (in cookie client must send correct refreshToken that will be revoked after refreshing) Device LastActiveDate should be overrode by issued Date of new refresh token',
  })
  @UseGuards(JwtRefreshGuard)
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

  @Post('logout')
  @ApiOperation({
    summary:
      'In cookie client must send correct refreshToken that will be revoked',
  })
  @UseGuards(JwtRefreshGuard)
  @HttpCode(204)
  async logout(@RefreshToken() refreshToken: string): Promise<boolean> {
    const decodedToken: any = this.jwtService.decode(refreshToken);
    const deviceId = decodedToken.deviceId;
    return this.commandBus.execute(new DeviceDeleteForLogoutCommand(deviceId));
  }
}
