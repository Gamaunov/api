import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmCodeInputModel {
  @IsString()
  @IsNotEmpty()
  code: string;
}
