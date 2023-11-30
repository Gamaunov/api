import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';

import { AppModule } from './app.module';
import { customExceptionFactory } from './shared/exceptions/exception.factory';
import { HttpExceptionFilter } from './shared/exceptions/exception.filter';

export const appSettings = (app): void => {
  app.enableVersioning();
  app.use(cookieParser());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: customExceptionFactory,
    }),
  );

  app.enableCors();
  app.useGlobalFilters(new HttpExceptionFilter());
};
