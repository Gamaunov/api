import * as process from 'process';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { appSettings } from './app.settings';

const PORT = parseInt(process.env.PORT, 10) || 5000;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  appSettings(app);

  await app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
  });
}
bootstrap();
