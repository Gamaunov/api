import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import bcrypt from 'bcrypt';

import { NewPasswordDTO } from '../../../../../dto/new-password.dto';
import { UsersRepository } from '../../../../../../users/infrastructure/users.repository';
import { UserDocument } from '../../../../../../users/user.entity';

export class PasswordUpdateCommand {
  constructor(public newPasswordDTO: NewPasswordDTO) {}
}

@CommandHandler(PasswordUpdateCommand)
export class PasswordUpdateUseCase
  implements ICommandHandler<PasswordUpdateCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: PasswordUpdateCommand): Promise<UserDocument | null> {
    const user = await this.usersRepository.findUserByRecoveryCode(
      command.newPasswordDTO.recoveryCode,
    );

    if (!user || !user.passwordCanBeUpdated()) {
      return null;
    }

    const hash = await bcrypt.hash(
      command.newPasswordDTO.newPassword,
      Number(process.env.HASH_ROUNDS),
    );

    await user.updatePassword(hash);
    return this.usersRepository.save(user);
  }
}
