import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';
import { randomUUID } from 'crypto';

import {
  createUserInput,
  userEmail01,
  userEmail02,
  userLogin02,
  userPassword,
} from '../base/utils/constants/users.constants';
import {
  auth_registration_uri,
  basicAuthLogin,
  basicAuthPassword,
  userAgent1,
} from '../base/utils/constants/auth.constants';
import {
  lorem10,
  lorem15,
  lorem20,
  lorem30,
} from '../base/utils/constants/constants';
import { wait } from '../base/utils/functions/wait';
import { initializeApp } from '../base/utils/functions/initializeApp';
import { UsersTestManager } from '../base/managers/users.manager';

describe('Auth: auth/registration', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const result = await initializeApp();
    app = result.app;
    agent = result.agent;
    usersTestManager = new UsersTestManager(app);
  });

  describe('negative: auth/registration', () => {
    it(`should create 1 user`, async () => {
      await usersTestManager.createUser(
        basicAuthLogin,
        basicAuthPassword,
        createUserInput,
      );
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
  });

  afterAll(async () => {
    await app.close();
  });
});
