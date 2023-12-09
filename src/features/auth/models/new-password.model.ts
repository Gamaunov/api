import { Length } from 'class-validator';

export class NewPasswordModel {
  @Length(6, 20)
  newPassword: string;

  recoveryCode: string;
}
