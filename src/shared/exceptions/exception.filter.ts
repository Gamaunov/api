import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { exceptionResponseType } from '../types/exceptions.types';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    if (status === HttpStatus.BAD_REQUEST || status === HttpStatus.NOT_FOUND) {
      const errorsResponse: exceptionResponseType = {
        errorsMessages: [],
      };
      const responseBody: any = exception.getResponse();

      if (typeof responseBody.message !== 'string') {
        responseBody.message.forEach((m) =>
          errorsResponse.errorsMessages.push(m),
        );
        response.status(status).json(errorsResponse);
      } else {
        response.status(status).json(responseBody.message);
      }
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
