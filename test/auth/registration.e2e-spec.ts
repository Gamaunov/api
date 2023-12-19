import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';
import { randomUUID } from 'crypto';

import {
  createUserInput,
  userEmail01,
  userEmail02,
  userEmail03,
  userLogin02,
  userLogin03,
  userPassword,
} from '../base/utils/constants/users.constants';
import {
  auth_registration_uri,
  userAgent1,
} from '../base/utils/constants/auth.constants';
import {
  lorem10,
  lorem15,
  lorem20,
  lorem30,
} from '../base/utils/constants/constants';
import { wait } from '../base/utils/functions/wait';
import { initializeApp } from '../base/settings/initializeApp';
import { UsersTestManager } from '../base/managers/users.manager';
import { SendRegistrationMailUseCase } from '../../src/features/mail/application/use-cases/send-registration-mail.use-case';
import { UsersRepository } from '../../src/features/users/infrastructure/users.repository';
import { testing_allData_uri } from '../base/utils/constants/testing.constants';

describe('Auth: auth/registration', () => {
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

  describe('negative: auth/registration', () => {
    it(`should create 1 user`, async () => {
      await usersTestManager.createUser(createUserInput);
    });

    // negative
    it(`should return 400 when trying to Register in the system with incorrect login`, async () => {
      const response = await agent
        .post(auth_registration_uri)
        .send({
          login: '',
          password: 'password123',
          email: 'some@gmail.com',
        })
        .expect(400);

      expect(response.body).toHaveProperty('errorsMessages');
      expect(response.body.errorsMessages).toBeInstanceOf(Array);

      const firstErrorMessage = response.body.errorsMessages[0];

      expect(firstErrorMessage).toHaveProperty('message');
      expect(firstErrorMessage).toHaveProperty('field');

      expect(firstErrorMessage.field).toBe('login');

      expect(typeof firstErrorMessage.message).toBe('string');
    });

    it(`should return 400 when trying to Register in the system with incorrect login`, async () => {
      const response = await agent
        .post(auth_registration_uri)
        .send({
          login: 'we', //minLength: 3
          password: 'password123',
          email: 'some@gmail.com',
        })
        .expect(400);

      expect(response.body).toHaveProperty('errorsMessages');
      expect(response.body.errorsMessages).toBeInstanceOf(Array);

      const firstErrorMessage = response.body.errorsMessages[0];

      expect(firstErrorMessage).toHaveProperty('message');
      expect(firstErrorMessage).toHaveProperty('field');

      expect(firstErrorMessage.field).toBe('login');

      expect(typeof firstErrorMessage.message).toBe('string');
    });

    it(`should return 400 when trying to Register in the system with incorrect login`, async () => {
      const response = await agent
        .post(auth_registration_uri)
        .send({
          login: lorem15, //maxLength: 10
          password: 'password123',
          email: 'some@gmail.com',
        })
        .expect(400);

      expect(response.body).toHaveProperty('errorsMessages');
      expect(response.body.errorsMessages).toBeInstanceOf(Array);

      const firstErrorMessage = response.body.errorsMessages[0];

      expect(firstErrorMessage).toHaveProperty('message');
      expect(firstErrorMessage).toHaveProperty('field');

      expect(firstErrorMessage.field).toBe('login');

      expect(typeof firstErrorMessage.message).toBe('string');
    });

    it(`should return 400 when trying to Register in the system with incorrect password`, async () => {
      const response = await agent
        .post(auth_registration_uri)
        .send({
          login: lorem10,
          password: '',
          email: 'some@gmail.com',
        })
        .expect(400);

      expect(response.body).toHaveProperty('errorsMessages');
      expect(response.body.errorsMessages).toBeInstanceOf(Array);

      const firstErrorMessage = response.body.errorsMessages[0];

      expect(firstErrorMessage).toHaveProperty('message');
      expect(firstErrorMessage).toHaveProperty('field');

      expect(firstErrorMessage.field).toBe('password');

      expect(typeof firstErrorMessage.message).toBe('string');
    });

    it(`should return 400 when trying to Register in the system with incorrect password`, async () => {
      const response = await agent
        .post(auth_registration_uri)
        .send({
          login: lorem10,
          password: '12345', //minLength: 6
          email: 'some@gmail.com',
        })
        .expect(400);

      expect(response.body).toHaveProperty('errorsMessages');
      expect(response.body.errorsMessages).toBeInstanceOf(Array);

      const firstErrorMessage = response.body.errorsMessages[0];

      expect(firstErrorMessage).toHaveProperty('message');
      expect(firstErrorMessage).toHaveProperty('field');

      expect(firstErrorMessage.field).toBe('password');

      expect(typeof firstErrorMessage.message).toBe('string');
    });

    it(`should return 400 when trying to Register in the system with incorrect password`, async () => {
      await wait(10);

      await agent
        .post(auth_registration_uri)
        .send({
          login: 'lorem10',
          password: lorem30, //maxLength: 20
          email: 'some@gmail.com',
        })
        .expect(400);
    }, 15000);

    it(`should return 400 when trying to Register in the system with incorrect email`, async () => {
      await agent
        .post(auth_registration_uri)
        .send({
          login: lorem10,
          password: lorem20,
          email: '',
        })
        .expect(400);
    });

    it(`should return 400 when trying to Register in the system with incorrect email`, async () => {
      await agent
        .post(auth_registration_uri)
        .send({
          login: lorem10,
          password: lorem20,
          email: 'some@gmail',
        })
        .expect(400);
    });

    it(`should return 400 when trying to Register in the system with incorrect email`, async () => {
      await agent
        .post(auth_registration_uri)
        .send({
          login: lorem10,
          password: lorem20,
          email: 'somegmail.com', //pattern: ^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$
        })
        .expect(400);
    });

    it(`should return 429 when More than 5 attempts from one IP-address during 10 seconds`, async () => {
      await wait(10);

      const id = randomUUID();
      let i = 0;
      while (i < 10) {
        const response = await agent
          .post(auth_registration_uri)
          .set('User-Agent', userAgent1)
          .set('x-real-ip', id)
          .send({
            login: `${userLogin02}${i}`,
            password: userPassword,
            email: `${i}${userEmail01}`,
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

  describe('positive: auth/registration', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
    });

    it(`should return 204 when trying to Register in the system`, async () => {
      await wait(10);

      await agent
        .post(auth_registration_uri)
        .send({
          login: userLogin02,
          password: userPassword + 1,
          email: userEmail02,
        })
        .expect(204);
    }, 50000);

    it(`should return 204 when trying to Register in the system, 
    SendRegistrationMailUseCase should be called`, async () => {
      const executeSpy = jest.spyOn(
        SendRegistrationMailUseCase.prototype,
        'execute',
      );

      await agent
        .post(auth_registration_uri)
        .send({
          login: userLogin03,
          password: userPassword,
          email: userEmail03,
        })
        .expect(204);

      const confirmationCode = await usersTestManager.getConfirmationCode(
        userEmail03,
      );

      expect(executeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          login: userLogin03,
          email: userEmail03,
          confirmationCode: confirmationCode,
        }),
      );

      executeSpy.mockClear();
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
