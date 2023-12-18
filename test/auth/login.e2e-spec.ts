import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';
import { randomUUID } from 'crypto';

import {
  createUserInput,
  userLogin01,
  userPassword,
} from '../base/utils/constants/users.constants';
import {
  auth_login_uri,
  basicAuthLogin,
  basicAuthPassword,
} from '../base/utils/constants/auth.constants';
import { wait } from '../base/utils/functions/wait';
import { initializeApp } from '../base/utils/functions/initializeApp';
import { UsersTestManager } from '../base/managers/users.manager';

describe('Auth: auth/login', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const result = await initializeApp();
    app = result.app;
    agent = result.agent;
    usersTestManager = new UsersTestManager(app);
  });

  describe('negative: auth/login', () => {
    it(`should create 1 user`, async () => {
      await usersTestManager.createUser(
        basicAuthLogin,
        basicAuthPassword,
        createUserInput,
      );
    });

    // negative
    it(`should return 401 when trying to login user with incorrect login or email`, async () => {
      await agent
        .post(auth_login_uri)
        .send({
          loginOrEmail: randomUUID(),
          password: userPassword,
        })
        .expect(401);
    });

    it(`should return 401 when trying to login user with incorrect login or email`, async () => {
      await agent
        .post(auth_login_uri)
        .send({
          loginOrEmail: '',
          password: userPassword,
        })
        .expect(401);
    });

    it(`should return 401 when trying to login user with incorrect password`, async () => {
      await agent
        .post(auth_login_uri)
        .send({
          loginOrEmail: userLogin01,
          password: randomUUID(),
        })
        .expect(401);
    });

    it(`should return 401 when trying to login user with incorrect password`, async () => {
      await agent
        .post(auth_login_uri)
        .send({
          loginOrEmail: userLogin01,
          password: '',
        })
        .expect(401);
    });

    it(`should return 401 when trying to login user with incorrect password`, async () => {
      await agent
        .post(auth_login_uri)
        .send({
          loginOrEmail: userLogin01,
          password: `${userPassword}   `,
        })
        .expect(401);
    });
  });

  describe('positive: auth/login', () => {
    it(`should login user`, async () => {
      await wait(10);

      const response = await agent
        .post(auth_login_uri)
        .send({
          loginOrEmail: userLogin01,
          password: userPassword,
        })
        .expect(200);

      const refreshTokenUser01 = response.headers['set-cookie'][0];

      expect(refreshTokenUser01).toMatch(/^refreshToken=/);
    }, 15000);
  });

  afterAll(async () => {
    await app.close();
  });
});
