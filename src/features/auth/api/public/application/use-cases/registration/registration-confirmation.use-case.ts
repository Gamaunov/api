import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ConfirmCodeInputDto } from '../../../../../dto/user-confirm.dto';
import { UsersRepository } from '../../../../../../users/infrastructure/users.repository';
import { UserDocument } from '../../../../../../users/user.entity';

export class RegistrationConfirmationCommand {
  constructor(public confirmCodeInputDTO: ConfirmCodeInputDto) {}
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
      command.confirmCodeInputDTO.code,
    );

    if (!user || !user.userCanBeConfirmed()) {
      return null;
    }

    await user.confirmUser();
    return this.usersRepository.save(user);
  }
}
