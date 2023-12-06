import { IsNotEmpty, IsString } from 'class-validator';

export abstract class ConfirmCodeInputDTO {
  @IsString()
  @IsNotEmpty()
  code: string;
}
