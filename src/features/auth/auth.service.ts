import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import { InjectModel } from '@nestjs/mongoose';

import { DevicesRepository } from '../devices/devices.repository';
import { DeviceDocument } from '../devices/schemas/device.entity';
import {
  User,
  UserDocument,
  UserModelType,
} from '../users/schemas/user.entity';
import { UsersRepository } from '../users/users.repository';
import { MailService } from '../mail/mail.service';
import { UserInputDTO } from '../users/dto/user-input-dto';

import { jwtConstants } from './constants';
import { UserConfirmDTO } from './dto/user-confirm.dto';
import { EmailDTO } from './dto/email.dto';
import { NewPasswordDTO } from './dto/new-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
    private readonly devicesRepository: DevicesRepository,
  ) {}

  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      loginOrEmail,
    );

    if (!user || !user.emailConfirmation.isConfirmed) {
      return null;
    }

    const result = await bcrypt.compare(
      password,
      user.accountData.passwordHash,
    );

    if (result) {
      return user;
    }

    return null;
  }

  async validateRefreshToken(payload): Promise<DeviceDocument | null> {
    const device = await this.devicesRepository.findDevice(payload.deviceId);

    if (!device || payload.iat < device.lastActiveDate) {
      return null;
    }

    return device;
  }

  async getTokens(userId: string, deviceId: string = randomUUID()) {
    const accessTokenPayload = { sub: userId };
    const refreshTokenPayload = { sub: userId, deviceId: deviceId };

    const accessToken = this.jwtService.sign(accessTokenPayload, {
      secret: jwtConstants.accessTokenSecret,
      expiresIn: jwtConstants.accessTokenExpirationTime,
    } as JwtSignOptions);

    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: jwtConstants.refreshTokenSecret,
      expiresIn: jwtConstants.refreshTokenExpirationTime,
    } as JwtSignOptions);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async registerUser(userInputDTO: UserInputDTO): Promise<UserDocument | null> {
    const hash = await bcrypt.hash(userInputDTO.password, 10);

    const emailData = {
      confirmationCode: randomUUID(),
      expirationDate: add(new Date(), { hours: 1 }),
      isConfirmed: false,
    };

    const user = this.UserModel.createUser(
      userInputDTO,
      this.UserModel,
      hash,
      emailData,
    );

    const result = await this.usersRepository.save(user);

    try {
      await this.mailService.sendRegistrationMail(
        userInputDTO.login,
        userInputDTO.email,
        emailData.confirmationCode,
      );
    } catch (error) {
      console.error(error);
      await this.usersRepository.deleteUser(user.id);
      return null;
    }

    return result;
  }

  async resendEmail(emailDTO: EmailDTO): Promise<UserDocument | null> {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      emailDTO.email,
    );

    if (!user || user.emailConfirmation.isConfirmed) {
      return null;
    }

    const newConfirmationCode = randomUUID();

    await user.updateEmailConfirmationData(newConfirmationCode);
    const result = await this.usersRepository.save(user);

    try {
      await this.mailService.sendRegistrationMail(
        user.accountData.login,
        user.accountData.email,
        newConfirmationCode,
      );
    } catch (error) {
      console.error(error);
      return null;
    }

    return result;
  }

  async confirmUser(
    userConfirmDTO: UserConfirmDTO,
  ): Promise<UserDocument | null> {
    const user = await this.usersRepository.findUserByEmailCode(
      userConfirmDTO.code,
    );

    if (!user || !user.userCanBeConfirmed()) {
      return null;
    }

    await user.confirmUser();
    return this.usersRepository.save(user);
  }

  async recoverPassword(emailDTO: EmailDTO): Promise<UserDocument | null> {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      emailDTO.email,
    );

    if (!user) {
      return null;
    }

    const recoveryCode = randomUUID();

    await user.updatePasswordRecoveryData(recoveryCode);
    const result = await this.usersRepository.save(user);

    try {
      await this.mailService.sendPasswordRecoveryMail(
        user.accountData.login,
        user.accountData.email,
        recoveryCode,
      );
    } catch (error) {
      console.error(error);
      return null;
    }

    return result;
  }

  async updatePassword(
    newPasswordDTO: NewPasswordDTO,
  ): Promise<UserDocument | null> {
    const user = await this.usersRepository.findUserByRecoveryCode(
      newPasswordDTO.recoveryCode,
    );

    if (!user || !user.passwordCanBeUpdated()) {
      return null;
    }

    const hash = await bcrypt.hash(newPasswordDTO.newPassword, 10);

    await user.updatePassword(hash);
    return this.usersRepository.save(user);
  }
}
