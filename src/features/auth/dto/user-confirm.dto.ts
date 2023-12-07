import { IsNotEmpty, IsString } from 'class-validator';

export abstract class ConfirmCodeInputDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
