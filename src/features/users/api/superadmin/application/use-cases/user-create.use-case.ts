import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import bcrypt from 'bcrypt';

import { UsersRepository } from '../../../../infrastructure/users.repository';
import { User, UserModelType } from '../../../../domain/user.entity';
import { UserInputModel } from '../../../models/user-input-model';

export class UserCreateCommand {
  constructor(public userInputDTO: UserInputModel) {}
}

@CommandHandler(UserCreateCommand)
export class UserCreateUseCase implements ICommandHandler<UserCreateCommand> {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: UserCreateCommand): Promise<string | null> {
    const hash = await bcrypt.hash(command.userInputDTO.password, 10);
    const user = this.UserModel.createUser(
      this.UserModel,
      command.userInputDTO,
      hash,
    );
    await this.usersRepository.save(user);
    return user.id;
  }
}
