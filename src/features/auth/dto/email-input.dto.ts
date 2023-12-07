import { IsEmail } from 'class-validator';

export class EmailInputDTO {
  @IsEmail()
  email: string;
}
