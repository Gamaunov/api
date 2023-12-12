import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

import { UsersRepository } from '../../../../../users/infrastructure/users.repository';

@Injectable()
export class AuthService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async checkCredentials(loginOrEmail: string, password: string) {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      loginOrEmail,
    );

    if (!user) return null;

    if (!user.emailConfirmation.isConfirmed) return null;

    const isHashesEquals: boolean = await this._isPasswordCorrect(
      password,
      user.accountData.passwordHash,
    );

    return isHashesEquals ? user._id.toString() : null;
  }

  async _isPasswordCorrect(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
