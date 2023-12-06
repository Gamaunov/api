import { IsEmail, Length, Matches } from 'class-validator';

import { IsUserAlreadyExist } from '../../../shared/exceptions/decorators/unique-user.decorator';
import {
  emailNotUnique,
  loginNotUnique,
} from '../../../shared/constants/constants';

export abstract class UserInputDTO {
  @Length(3, 10)
  @Matches(/^[a-zA-Z0-9_-]*$/)
  @IsUserAlreadyExist({
    message: loginNotUnique,
  })
  login: string;

  @Length(6, 20)
  password: string;

  @IsEmail()
  @IsUserAlreadyExist({
    message: emailNotUnique,
  })
  email: string;
}
