import { BadRequestException } from '@nestjs/common';

import { exceptionObjectType } from '../types/exceptions.types';

export const customExceptionFactory = (errors): void => {
  const errorsForResponse: exceptionObjectType[] = [];

  errors.forEach((e): void => {
    const constraintKeys: string[] = Object.keys(e.constraints);

    constraintKeys.forEach((k: string): void => {
      errorsForResponse.push({
        message: e.constraints[k],
        field: e.property,
      });
    });
  });

  throw new BadRequestException(errorsForResponse);
};
