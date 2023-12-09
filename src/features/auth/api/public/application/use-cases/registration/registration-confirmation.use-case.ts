import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ConfirmCodeInputModel } from '../../../../../models/user-confirm.model';
import { UsersRepository } from '../../../../../../users/infrastructure/users.repository';
import { UserDocument } from '../../../../../../users/domain/user.entity';

export class RegistrationConfirmationCommand {
  constructor(public confirmCodeInputModel: ConfirmCodeInputModel) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase
  implements ICommandHandler<RegistrationConfirmationCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(
    command: RegistrationConfirmationCommand,
  ): Promise<UserDocument | null> {
    const user = await this.usersRepository.findUserByEmailCode(
      command.confirmCodeInputModel.code,
    );

    if (!user || !user.userCanBeConfirmed()) {
      return null;
    }

    await user.confirmUser();
    return this.usersRepository.save(user);
  }
}
