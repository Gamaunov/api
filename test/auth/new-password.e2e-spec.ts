import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';
import { randomUUID } from 'crypto';

import {
  userEmail01,
  userLogin01,
  userPassword,
} from '../base/utils/constants/users.constants';
import {
  auth_newPassword_uri,
  auth_passwordRecovery_uri,
  auth_registration_uri,
  auth_registrationConfirmation_uri,
} from '../base/utils/constants/auth.constants';
import { initializeApp } from '../base/settings/initializeApp';
import { UsersTestManager } from '../base/managers/users.manager';
import { wait } from '../base/utils/functions/wait';
import { testing_allData_uri } from '../base/utils/constants/testing.constants';
import { UsersRepository } from '../../src/features/users/infrastructure/users.repository';

describe('Auth: auth/new-password', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const result = await initializeApp();
    app = result.app;
    agent = result.agent;
    const usersRepository = app.get(UsersRepository);
    usersTestManager = new UsersTestManager(app, usersRepository);
  });

  describe('negative: auth/new-password', () => {
    it(`should return 400 If the inputModel has incorrect value`, async () => {
      await agent
        .post(auth_newPassword_uri)
        .send({
          newPassword: 'new271543523',
          recoveryCode: '',
        })
        .expect(400);
    });

    it(`should return 400 If the inputModel has incorrect value`, async () => {
      await agent
        .post(auth_newPassword_uri)
        .send({
          newPassword: 'new271543523',
          recoveryCode: randomUUID(),
        })
        .expect(400);
    });

    it(`should return 429 if More than 5 attempts from one IP-address during 10 seconds`, async () => {
      await wait(10);

      let i = 0;
      while (i < 10) {
        const response = await agent.post(auth_newPassword_uri).send({
          newPassword: 'new271543523',
          recoveryCode: randomUUID(),
        });

        if (i < 5) {
          expect(response.status).toBe(400);
        } else {
          expect(response.status).toBe(429);
        }
        i++;
      }
    }, 20000);
  });

  describe('positive: auth/new-password', () => {
    it(`should clear db, wait 10s`, async () => {
      await agent.delete(testing_allData_uri);
      await wait(10);
    }, 15000);

    it(`should Confirm Password recovery`, async () => {
      await agent
        .post(auth_registration_uri)
        .send({
          login: userLogin01,
          password: userPassword,
          email: userEmail01,
        })
        .expect(204);

      const confirmationCode = await usersTestManager.getConfirmationCode(
        userEmail01,
      );

      await agent
        .post(auth_registrationConfirmation_uri)
        .send({
          code: confirmationCode,
        })
        .expect(204);

      await agent
        .post(auth_passwordRecovery_uri)
        .send({
          email: userEmail01,
        })
        .expect(204);

      const recoveryCode = await usersTestManager.getRecoveryCode(userEmail01);

      await agent
        .post(auth_newPassword_uri)
        .send({
          newPassword: 'new271543523',
          recoveryCode: recoveryCode,
        })
        .expect(204);
    }, 10000);
  });

  afterAll(async () => {
    await app.close();
  });
});
