import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';

import { User, UserModelType } from './schemas/user.entity';
import { UsersRepository } from './users.repository';
import { CreateUserDTO } from './dto/create-user.dto';
import { UserView } from './schemas/user.view';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private readonly usersRepository: UsersRepository,
  ) {}

  async createUser(createUserDto: CreateUserDTO): Promise<UserView> {
    const hash = await bcrypt.hash(createUserDto.password, 10);
    const user = this.UserModel.createUser(createUserDto, this.UserModel, hash);
    return this.usersRepository.createUser(user);
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = await this.usersRepository.findUser(id);

    if (!user) {
      throw new InternalServerErrorException('user not found');
    }

    return this.usersRepository.deleteUser(id);
  }

  async deleteAllUsers(): Promise<boolean> {
    return this.usersRepository.deleteAllUsers();
  }
}
