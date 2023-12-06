import { Length } from 'class-validator';

export abstract class NewPasswordDTO {
  @Length(6, 20)
  newPassword: string;

  recoveryCode: string;
}
