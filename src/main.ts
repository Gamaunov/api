import { NestFactory } from '@nestjs/core';
import * as process from 'process';
import { configDotenv } from 'dotenv';

import { AppModule } from './app.module';

configDotenv();

const PORT = parseInt(process.env.PORT!, 10) || 5000;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
  });
}
bootstrap();
