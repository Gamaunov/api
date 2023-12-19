import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import {
  createUserInput,
  userEmail01,
  userEmail02,
  userEmail03,
  userLogin01,
  userLogin02,
  userLogin03,
  userPassword,
} from '../base/utils/constants/users.constants';
import {
  auth_registration_uri,
  auth_registrationEmailResending_uri,
} from '../base/utils/constants/auth.constants';
import { wait } from '../base/utils/functions/wait';
import { initializeApp } from '../base/settings/initializeApp';
import { UsersTestManager } from '../base/managers/users.manager';
import { testing_allData_uri } from '../base/utils/constants/testing.constants';
import { SendRegistrationMailUseCase } from '../../src/features/mail/application/use-cases/send-registration-mail.use-case';
import { UsersRepository } from '../../src/features/users/infrastructure/users.repository';

describe('Auth: auth/registration-email-resending', () => {
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

  describe('negative: auth/registration-email-resending', () => {
    it(`should return 400 If the inputModel has incorrect values`, async () => {
      const response = await agent
        .post(auth_registrationEmailResending_uri)
        .send({
          email: userEmail02,
        })
        .expect(400);

      expect(response.body).toHaveProperty('errorsMessages');
      expect(response.body.errorsMessages).toBeInstanceOf(Array);

      const firstErrorMessage = response.body.errorsMessages[0];

      expect(firstErrorMessage).toHaveProperty('message');
      expect(firstErrorMessage).toHaveProperty('field');

      expect(firstErrorMessage.field).toBe('email');

      expect(typeof firstErrorMessage.message).toBe('string');
    });

    it(`should return 400 If user already confirmed`, async () => {
      await usersTestManager.createUser(createUserInput);

      const response = await agent
        .post(auth_registrationEmailResending_uri)
        .send({
          email: userEmail01,
        })
        .expect(400);

      expect(response.body).toHaveProperty('errorsMessages');
      expect(response.body.errorsMessages).toBeInstanceOf(Array);

      const firstErrorMessage = response.body.errorsMessages[0];

      expect(firstErrorMessage).toHaveProperty('message');
      expect(firstErrorMessage).toHaveProperty('field');

      expect(firstErrorMessage.field).toBe('email');

      expect(typeof firstErrorMessage.message).toBe('string');
    });

    it(`should return 429 when More than 5 attempts from one IP-address during 10 seconds`, async () => {
      await agent.delete(testing_allData_uri);

      await wait(10);

      await agent
        .post(auth_registration_uri)
        .send({
          login: userLogin01,
          password: userPassword,
          email: userEmail01,
        })
        .expect(204);

      let i = 0;
      while (i < 10) {
        const response = await agent
          .post(auth_registrationEmailResending_uri)
          .send({
            email: userEmail01,
          });

        if (i < 5) {
          expect(response.status).toBe(204);
        } else {
          expect(response.status).toBe(429);
        }
        i++;
      }
    }, 50000);
  });

  describe('positive: auth/registration-email-resending', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
    });

    it(`should Resend confirmation registration Email if user exists`, async () => {
      await wait(10);

      await agent
        .post(auth_registration_uri)
        .send({
          login: userLogin02,
          password: userPassword,
          email: userEmail02,
        })
        .expect(204);

      await agent
        .post(auth_registrationEmailResending_uri)
        .send({
          email: userEmail02,
        })
        .expect(204);
    }, 20000);

    it(`"should Resend confirmation registration Email, 
    SendRegistrationMailUseCase should be called`, async () => {
      await agent
        .post(auth_registration_uri)
        .send({
          login: userLogin03,
          password: userPassword,
          email: userEmail03,
        })
        .expect(204);

      const executeSpy = jest.spyOn(
        SendRegistrationMailUseCase.prototype,
        'execute',
      );

      await agent
        .post(auth_registrationEmailResending_uri)
        .send({ email: userEmail03 })
        .expect(204);

      expect(executeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          email: userEmail03,
        }),
      );

      executeSpy.mockClear();
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
