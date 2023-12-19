import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { auth_passwordRecovery_uri } from '../base/utils/constants/auth.constants';
import { initializeApp } from '../base/settings/initializeApp';
import { UsersTestManager } from '../base/managers/users.manager';
import { testing_allData_uri } from '../base/utils/constants/testing.constants';
import { UsersRepository } from '../../src/features/users/infrastructure/users.repository';
import {
  userEmail01,
  userEmail03,
} from '../base/utils/constants/users.constants';
import { PasswordRecoveryUseCase } from '../../src/features/auth/api/public/application/use-cases/password/password-recovery.use-case';
import { wait } from '../base/utils/functions/wait';

describe('Auth: auth/password-recovery', () => {
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

  describe('negative: auth/password-recovery', () => {
    it(`should return 400 If the inputModel has invalid email, 
    PasswordRecoveryUseCase should not be called`, async () => {
      const executeSpy = jest.spyOn(
        PasswordRecoveryUseCase.prototype,
        'execute',
      );

      await agent
        .post(auth_passwordRecovery_uri)
        .send({
          email: '',
        })
        .expect(400);

      expect(executeSpy).not.toHaveBeenCalled();
    });

    it(`should return 400 If the inputModel has invalid email`, async () => {
      const executeSpy = jest.spyOn(
        PasswordRecoveryUseCase.prototype,
        'execute',
      );

      await agent
        .post(auth_passwordRecovery_uri)
        .send({
          email: 'some@email',
        })
        .expect(400);

      expect(executeSpy).not.toHaveBeenCalled();
    });

    it(`should return 429 if More than 5 attempts from one IP-address during 10 seconds`, async () => {
      await wait(10);

      let i = 0;
      while (i < 10) {
        const response = await agent.post(auth_passwordRecovery_uri).send({
          email: userEmail03,
        });

        if (i < 5) {
          expect(response.status).toBe(204);
        } else {
          expect(response.status).toBe(429);
        }
        i++;
      }
    }, 20000);
  });

  describe('positive: auth/password-recovery', () => {
    it(`should clear db, wait 10s`, async () => {
      await agent.delete(testing_allData_uri);
      await wait(10);
    }, 15000);

    it(`should Confirm Password recovery, PasswordRecoveryUseCase should be called`, async () => {
      const executeSpy = jest.spyOn(
        PasswordRecoveryUseCase.prototype,
        'execute',
      );

      await agent
        .post(auth_passwordRecovery_uri)
        .send({
          email: userEmail01,
        })
        .expect(204);

      expect(executeSpy).toHaveBeenCalled();
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
