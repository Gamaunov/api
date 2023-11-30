import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import bcrypt from 'bcrypt';

import { UsersRepository } from '../../../../infrastructure/users.repository';
import { User, UserModelType } from '../../../../user.entity';
import { UserInputDTO } from '../../../../dto/user-input-dto';

export class UserCreateCommand {
  constructor(public userInputDto: UserInputDTO) {}
}

@CommandHandler(UserCreateCommand)
export class UserCreateUseCase implements ICommandHandler<UserCreateCommand> {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: UserCreateCommand): Promise<string | null> {
    const hash = await bcrypt.hash(command.userInputDto.password, 10);
    const user = this.UserModel.createUser(
      this.UserModel,
      command.userInputDto,
      hash,
    );
    await this.usersRepository.save(user);
    return user.id;
  }
}
