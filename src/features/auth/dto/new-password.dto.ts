import { Length } from 'class-validator';

export abstract class NewPasswordDto {
  @Length(6, 20)
  newPassword: string;

  recoveryCode: string;
}
