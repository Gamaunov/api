import { IsEmail } from 'class-validator';

export abstract class EmailInputDto {
  @IsEmail()
  email: string;
}
