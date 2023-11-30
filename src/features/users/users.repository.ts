import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';

import { User, UserDocument, UserModelType } from './schemas/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}

  async save(user: UserDocument) {
    return user.save();
  }

  async createUser(user: UserDocument) {
    await user.save();
    return {
      id: user._id.toString(),
      login: user.accountData.login,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt.toISOString(),
    };
  }

  async findUserById(id: string): Promise<UserDocument | null> {
    if (!mongoose.isValidObjectId(id)) {
      throw new NotFoundException();
    }

    const user = await this.UserModel.findOne({ _id: id });

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserDocument | null> {
    const user = await this.UserModel.findOne({
      $or: [
        { 'accountData.login': loginOrEmail },
        { 'accountData.email': loginOrEmail },
      ],
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async findUserByEmailCode(code: string): Promise<UserDocument | null> {
    const user = this.UserModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async findUserByRecoveryCode(code: string): Promise<UserDocument | null> {
    const user = this.UserModel.findOne({
      'passwordRecovery.recoveryCode': code,
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async deleteUserById(id: string): Promise<boolean> {
    const user = await this.UserModel.deleteOne({ _id: id });
    return user.deletedCount === 1;
  }

  async deleteAllUsers(): Promise<boolean> {
    await this.UserModel.deleteMany({});
    return (await this.UserModel.countDocuments()) === 0;
  }
}
