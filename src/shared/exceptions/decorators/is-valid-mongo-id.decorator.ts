import { registerDecorator, ValidationOptions } from 'class-validator';
import * as mongoose from 'mongoose';

export function IsMongoIdObject(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsMongoIdObject',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          return mongoose.Types.ObjectId.isValid(value);
        },
      },
    });
  };
}
