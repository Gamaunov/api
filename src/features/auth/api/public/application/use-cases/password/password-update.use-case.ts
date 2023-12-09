import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import bcrypt from 'bcrypt';

import { NewPasswordModel } from '../../../../../models/new-password.model';
import { UsersRepository } from '../../../../../../users/infrastructure/users.repository';
import { UserDocument } from '../../../../../../users/domain/user.entity';

export class PasswordUpdateCommand {
  constructor(public newPasswordModel: NewPasswordModel) {}
}

@CommandHandler(PasswordUpdateCommand)
export class PasswordUpdateUseCase
  implements ICommandHandler<PasswordUpdateCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: PasswordUpdateCommand): Promise<UserDocument | null> {
    const user = await this.usersRepository.findUserByRecoveryCode(
      command.newPasswordModel.recoveryCode,
    );

    if (!user || !user.passwordCanBeUpdated()) {
      return null;
    }

    const hash = await bcrypt.hash(command.newPasswordModel.newPassword, 10);

    await user.updatePassword(hash);
    return this.usersRepository.save(user);
  }
}
