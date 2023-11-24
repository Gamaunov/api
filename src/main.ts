import { NestFactory } from '@nestjs/core';
import * as process from 'process';
import { configDotenv } from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

configDotenv();

const PORT = parseInt(process.env.PORT!, 10) || 5000;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Swagger Documentation')
    .setDescription('NestJS API')
    .setVersion('1.0')
    .addTag('API routes')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
  });
}
bootstrap();
