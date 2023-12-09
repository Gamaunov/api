import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';

import { UsersRepository } from '../../../../../../users/infrastructure/users.repository';
import {
  User,
  UserDocument,
  UserModelType,
} from '../../../../../../users/domain/user.entity';
import { UserInputModel } from '../../../../../../users/api/models/user-input-model';
import { SendRegistrationMailCommand } from '../../../../../../mail/application/use-cases/send-registration-mail.use-case';

export class RegistrationCommand {
  constructor(public userInputDTO: UserInputModel) {}
}

@CommandHandler(RegistrationCommand)
export class RegistrationUseCase
  implements ICommandHandler<RegistrationCommand>
{
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private commandBus: CommandBus,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: RegistrationCommand): Promise<UserDocument | null> {
    const hash = await bcrypt.hash(command.userInputDTO.password, 10);

    const emailData = {
      confirmationCode: randomUUID(),
      expirationDate: add(new Date(), { hours: 1 }),
      isConfirmed: false,
    };

    const user = this.UserModel.createUser(
      this.UserModel,
      command.userInputDTO,
      hash,
      emailData,
    );

    const result = await this.usersRepository.save(user);

    try {
      await this.commandBus.execute(
        new SendRegistrationMailCommand(
          command.userInputDTO.login,
          command.userInputDTO.email,
          emailData.confirmationCode,
        ),
      );
    } catch (error) {
      console.error(error);
      await this.usersRepository.deleteUser(user.id);
      return null;
    }

    return result;
  }
}
