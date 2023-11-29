import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import * as process from 'process';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './features/auth/auth.module';
import { TestingModule } from './features/testing/testing.module';
import { UsersModule } from './features/users/users.module';
import { MailModule } from './features/mail/mail.module';
import { MainModule } from './modules/main.module';

const DB_URI: string =
  process.env.NODE_ENV === 'production'
    ? process.env.MONGO_URI
    : process.env.MONGO_TEST_URI;

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(DB_URI),
    AuthModule,
    TestingModule,
    UsersModule,
    MailModule,
    MainModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
