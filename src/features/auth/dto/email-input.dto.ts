import { IsEmail } from 'class-validator';

export abstract class EmailInputDTO {
  @IsEmail()
  email: string;
}
