import { BadRequestException } from '@nestjs/common';

type ErrorsForResponseType = {
  message: string;
  field: string;
};

export const customExceptionFactory = (errors) => {
  const errorsForResponse: ErrorsForResponseType[] = [];

  errors.forEach((e) => {
    const keys = Object.keys(e.constraints);

    keys.forEach((k) => {
      errorsForResponse.push({
        message: e.constraints[k],
        field: e.property,
      });
    });
  });

  throw new BadRequestException(errorsForResponse);
};
