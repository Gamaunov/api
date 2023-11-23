import * as dotenv from 'dotenv';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import * as process from 'process';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MainModule } from './modules/main.module';

dotenv.config();

const ROOT = process.env.MONGO_URI || 'mongodb://localhost:27017';

@Module({
  imports: [ConfigModule.forRoot(), MongooseModule.forRoot(ROOT), MainModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
