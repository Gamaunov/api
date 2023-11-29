import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';

import { User, UserModelType } from './schemas/user.entity';
import { UsersRepository } from './users.repository';
import { UserInputDTO } from './dto/user-input-dto';
import { UserView } from './schemas/user.view';

import { userNotFound } from '@/shared/constants/constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private readonly usersRepository: UsersRepository,
  ) {}

  async createUser(userInputDTO: UserInputDTO): Promise<UserView> {
    const hash = await bcrypt.hash(userInputDTO.password, 10);
    const user = this.UserModel.createUser(userInputDTO, this.UserModel, hash);
    return this.usersRepository.createUser(user);
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = await this.usersRepository.findUserById(id);

    if (!user) {
      throw new InternalServerErrorException(userNotFound);
    }

    return this.usersRepository.deleteUser(id);
  }

  async deleteAllUsers(): Promise<boolean> {
    return this.usersRepository.deleteAllUsers();
  }
}
