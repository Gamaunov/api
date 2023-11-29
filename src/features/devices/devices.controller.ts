import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtRefreshGuard } from '../auth/guards/jwt-refresh.guard';
import { UserIdFromGuard } from '../auth/decorators/user-id-from-guard.param.decorator';
import { RefreshToken } from '../auth/decorators/refresh-token.param.decorator';

import { DevicesQueryRepository } from './devices.query.repository';
import { DevicesService } from './devices.service';

import { exceptionHandler } from '@/shared/exceptions/exception.handler';
import { ResultCode } from '@/shared/enums/result-code.enum';
import { ExceptionResultType } from '@/shared/types/exceptions.types';

@Controller('security')
export class DevicesController {
  constructor(
    private readonly devicesService: DevicesService,
    private readonly devicesQueryRepository: DevicesQueryRepository,
    private readonly jwtService: JwtService,
  ) {}

  @UseGuards(JwtRefreshGuard)
  @Get('devices')
  async getDevices(@UserIdFromGuard() userId: string) {
    return this.devicesQueryRepository.findDevices(userId);
  }

  @UseGuards(JwtRefreshGuard)
  @Delete('devices')
  @HttpCode(204)
  async deleteOldDevices(
    @RefreshToken() refreshToken: string,
  ): Promise<boolean> {
    const decodedToken: any = this.jwtService.decode(refreshToken);
    const deviceId = decodedToken?.deviceId;
    return this.devicesService.deleteOldDevices(deviceId);
  }

  @UseGuards(JwtRefreshGuard)
  @Delete('devices/:id')
  @HttpCode(204)
  async terminateSession(
    @UserIdFromGuard() userId: string,
    @Param('id') deviceId: string,
  ): Promise<ExceptionResultType<boolean> | void> {
    const result: ExceptionResultType<boolean> =
      await this.devicesService.terminateSession(userId, deviceId);

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }
}
