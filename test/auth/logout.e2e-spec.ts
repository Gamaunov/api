import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import {
  createUserInput,
  createUserInput2,
  loginUserInput,
} from '../base/utils/constants/users.constants';
import {
  auth_logout_uri,
  basicAuthLogin,
  basicAuthPassword,
  invalidRefreshToken,
} from '../base/utils/constants/auth.constants';
import { initializeApp } from '../base/utils/functions/initializeApp';
import { UsersTestManager } from '../base/managers/users.manager';
import { wait } from '../base/utils/functions/wait';

describe('Auth: auth/logout', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const result = await initializeApp();
    app = result.app;
    agent = result.agent;
    usersTestManager = new UsersTestManager(app);
  });

  describe('negative: auth/logout', () => {
    it(`should return 401 when trying to logout if cookie is incorrect`, async () => {
      await agent
        .post(auth_logout_uri)
        .set('Cookie', invalidRefreshToken)
        .expect(401);
    });

    it(`should return 401 when trying to logout if cookie is missing`, async () => {
      await agent.post(auth_logout_uri).expect(401);
    });

    it(`should return 401 when trying to logout if cookie is expired`, async () => {
      await usersTestManager.createUser(
        basicAuthLogin,
        basicAuthPassword,
        createUserInput,
      );

      const response = await usersTestManager.login(loginUserInput);

      const refreshTokenCookie = response
        .get('Set-Cookie')
        .find((cookie) => cookie.startsWith('refreshToken'));

      await wait(20);

      await agent
        .post(auth_logout_uri)
        .set('Cookie', refreshTokenCookie)
        .expect(401);
    }, 25000);
  });

  describe('positive: auth/logout', () => {
    it(`should logout user`, async () => {
      await usersTestManager.createUser(
        basicAuthLogin,
        basicAuthPassword,
        createUserInput2,
      );

      const response = await usersTestManager.login(loginUserInput);

      const refreshTokenCookie = response
        .get('Set-Cookie')
        .find((cookie) => cookie.startsWith('refreshToken'));

      await agent
        .post(auth_logout_uri)
        .set('Cookie', refreshTokenCookie)
        .expect(204);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
