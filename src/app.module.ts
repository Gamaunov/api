import * as dotenv from 'dotenv';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import * as process from 'process';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MainModule } from './modules/main.module';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';

const prodMongooseConfig =
  process.env.MONGO_URI || 'mongodb://0.0.0.0:27017/production';

const testMongooseConfig =
  process.env.MONGO_TEST_URI || 'mongodb://0.0.0.0:27017/test';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(isTest ? testMongooseConfig : prodMongooseConfig),
    MainModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
