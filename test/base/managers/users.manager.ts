import { INestApplication } from '@nestjs/common';
import supertest, { Response } from 'supertest';

import { UsersRepository } from '../../../src/features/users/infrastructure/users.repository';

export class UsersTestManager {
  constructor(
    protected readonly app: INestApplication,
    private readonly usersRepository: UsersRepository,
  ) {}

  expectCorrectModel(createModel: any, responseModel: any) {
    expect(createModel.name).toBe(responseModel.name);
    expect(createModel.email).toBe(responseModel.email);
  }

  async createUser(createModel: any): Promise<Response> {
    return supertest(this.app.getHttpServer())
      .post('/users')
      .auth('admin', 'qwerty')
      .send(createModel)
      .expect(201);
  }

  async updateUser(
    adminAccessToken: string,
    updateModel: any,
  ): Promise<Response> {
    return supertest(this.app.getHttpServer())
      .put('/users')
      .auth(adminAccessToken, {
        type: 'bearer',
      })
      .send(updateModel)
      .expect(204);
  }

  async login(loginModel: any): Promise<Response> {
    return await supertest(this.app.getHttpServer())
      .post('/auth/login')
      .send(loginModel)
      .expect(200);
  }

  async getConfirmationCode(loginOrEmail: string): Promise<any> {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      loginOrEmail,
    );

    return user?.emailConfirmation?.confirmationCode;
  }

  async getRecoveryCode(loginOrEmail: string): Promise<any> {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      loginOrEmail,
    );

    return user?.passwordRecovery?.recoveryCode;
  }

  async expirationDate(loginOrEmail: string): Promise<any> {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      loginOrEmail,
    );

    return user?.passwordRecovery?.expirationDate;
  }
}
