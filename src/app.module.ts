import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import * as process from 'process';
import { configDotenv } from 'dotenv';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MainModule } from './modules/main.module';

configDotenv();

const DB_URI =
  process.env.NODE_ENV! === 'production'
    ? process.env.MONGO_URI!
    : process.env.MONGO_TEST_URI!;

@Module({
  imports: [ConfigModule.forRoot(), MongooseModule.forRoot(DB_URI), MainModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
