import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmCodeInputDTO {
  @IsString()
  @IsNotEmpty()
  code: string;
}
