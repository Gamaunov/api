import { ConfigModule } from '@nestjs/config';
export const configModule_ENV = ConfigModule.forRoot({
  envFilePath: ['.env.local', '.env'],
});
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import * as process from 'process';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './features/auth/auth.module';
import { TestingModule } from './features/testing/testing.module';
import { UsersModule } from './features/users/users.module';
import { MailModule } from './features/mail/mail.module';
import { MainModule } from './modules/main.module';
import { DevicesModule } from './features/devices/devices.module';

const DB_URI: string =
  process.env.NODE_ENV === 'production'
    ? process.env.MONGO_URI
    : process.env.MONGO_TEST_URI;

@Module({
  imports: [
    configModule_ENV,
    MongooseModule.forRoot(DB_URI),
    CqrsModule,
    AuthModule,
    DevicesModule,
    MainModule,
    UsersModule,
    MailModule,
    TestingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
