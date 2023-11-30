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

import { UsersRepository } from '../users/users.repository';
import { DevicesService } from '../devices/devices.service';
import { UserInputDTO } from '../users/dto/user-input-dto';
import { exceptionHandler } from '../../shared/exceptions/exception.handler';
import { ResultCode } from '../../shared/enums/result-code.enum';
import {
  codeField,
  codeIsIncorrect,
  emailField,
  refreshToken_,
  unknown_,
  userAgent_,
  userNotFoundOrConfirmed,
} from '../../shared/constants/constants';

import { AuthService } from './auth.service';
import { EmailDTO } from './dto/email.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserIdFromGuard } from './decorators/user-id-from-guard.param.decorator';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { RefreshToken } from './decorators/refresh-token.param.decorator';
import { JwtBearerGuard } from './guards/jwt-bearer.guard';
import { UserConfirmDTO } from './dto/user-confirm.dto';
import { NewPasswordDTO } from './dto/new-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly devicesService: DevicesService,
    private readonly usersRepository: UsersRepository,
  ) {}
  @UseGuards(JwtBearerGuard)
  @Get('me')
  async getProfile(@UserIdFromGuard() userId: string) {
    const user = await this.usersRepository.findUserById(userId);

    return {
      email: user?.accountData.email,
      login: user?.accountData.login,
      id: userId,
    };
  }
  @Post('registration')
  @UseGuards(ThrottlerGuard)
  @HttpCode(204)
  async registerUser(@Body() userInputDTO: UserInputDTO) {
    return this.authService.registerUser(userInputDTO);
  }
  @Post('registration-email-resending')
  @UseGuards(ThrottlerGuard)
  @Throttle(5, 10)
  @HttpCode(204)
  async resendEmail(@Body() emailDTO: EmailDTO) {
    const result = await this.authService.resendEmail(emailDTO);

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
  @UseGuards(ThrottlerGuard)
  @Throttle(5, 10)
  @HttpCode(204)
  async confirmUser(@Body() userConfirmDTO: UserConfirmDTO) {
    const result = await this.authService.confirmUser(userConfirmDTO);

    if (!result) {
      return exceptionHandler(
        ResultCode.BadRequest,
        codeIsIncorrect,
        codeField,
      );
    }

    return result;
  }
  @Post('password-recovery')
  @UseGuards(ThrottlerGuard)
  @Throttle(5, 10)
  @HttpCode(204)
  async recoverPassword(@Body() emailDTO: EmailDTO) {
    return this.authService.recoverPassword(emailDTO);
  }
  @Post('new-password')
  @UseGuards(ThrottlerGuard)
  @Throttle(5, 10)
  @HttpCode(204)
  async updatePassword(@Body() newPasswordDTO: NewPasswordDTO) {
    return this.authService.updatePassword(newPasswordDTO);
  }
  @Post('login')
  @UseGuards(ThrottlerGuard, LocalAuthGuard)
  @Throttle(5, 10)
  @HttpCode(200)
  async login(
    @UserIdFromGuard() userId: string,
    @Ip() ip: string,
    @Headers() headers: string,
    @Response() res,
  ) {
    const userAgent = headers[userAgent_] || unknown_;
    const tokens = await this.authService.getTokens(userId);

    await this.devicesService.createDevice(tokens.refreshToken, ip, userAgent);

    res
      .cookie(refreshToken_, tokens.refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .json({ accessToken: tokens.accessToken });
  }
  @Post('refresh-token')
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
    const tokens = await this.authService.getTokens(userId, deviceId);
    const newToken = this.jwtService.decode(tokens.refreshToken);

    await this.devicesService.updateDevice(newToken, ip, userAgent);

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
    return this.devicesService.logout(deviceId);
  }
}
