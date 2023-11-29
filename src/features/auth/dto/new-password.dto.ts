import { Length } from 'class-validator';

export class NewPasswordDTO {
  @Length(6, 20)
  newPassword: string;

  recoveryCode: string;
}
