import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';

import { Device, DeviceSchema } from './domain/device.entity';
import { DevicesRepository } from './infrastructure/devices.repository';
import { DevicesQueryRepository } from './infrastructure/devices.query.repository';
import { DeviceDeleteForTerminateUseCase } from './api/public/application/use-cases/device-delete-for-terminate.use-case';
import { PublicDevicesController } from './api/public/public.devices.controller';
import { DevicesDeleteOldUseCase } from './api/public/application/use-cases/devices-delete-old.use-case';

const useCases = [DeviceDeleteForTerminateUseCase, DevicesDeleteOldUseCase];
const repositories = [DevicesRepository, DevicesQueryRepository];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }]),
    CqrsModule,
  ],
  controllers: [PublicDevicesController],
  providers: [JwtService, ...useCases, ...repositories],
})
export class DevicesModule {}
