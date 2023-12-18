import { INestApplication } from '@nestjs/common';
import supertest, { Response } from 'supertest';

export class UsersTestManager {
  constructor(protected readonly app: INestApplication) {}

  expectCorrectModel(createModel: any, responseModel: any) {
    expect(createModel.name).toBe(responseModel.name);
    expect(createModel.email).toBe(responseModel.email);
  }

  async createUser(
    username: string,
    password: string,
    createModel: any,
  ): Promise<Response> {
    return supertest(this.app.getHttpServer())
      .post('/users')
      .auth(username, password)
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
}
