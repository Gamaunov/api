import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';
import { randomUUID } from 'crypto';

import {
  userEmail01,
  userEmail02,
  userLogin01,
  userLogin02,
  userPassword,
  users_uri,
} from '../base/utils/constants/users.constants';
import {
  auth_login_uri,
  auth_newPassword_uri,
  auth_registration_uri,
  basicAuthLogin,
  basicAuthPassword,
  customIpAddress,
  registrationInputDto,
  userAgent1,
} from '../base/utils/constants/auth.constants';
import { wait } from '../base/utils/functions/wait';
import {
  lorem10,
  lorem15,
  lorem20,
  lorem30,
} from '../base/utils/constants/constants';
import { initializeApp } from '../base/settings/initializeApp';

describe('auth', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;

  beforeAll(async () => {
    const result = await initializeApp();
    app = result.app;
    agent = result.agent;
  });

  let accessTokenUser01;
  let refreshTokenUser01;
  let refreshTokenUser02;

  let devceId01;
  let devceId02;

  describe('users authentication', () => {
    it(`should create 2 users`, async () => {
      await agent
        .post(users_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: userLogin01,
          password: userPassword,
          email: userEmail01,
        })
        .expect(201);
      await agent
        .post(users_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: userLogin02,
          password: userPassword,
          email: userEmail02,
        })
        .expect(201);
    });

    // // negative
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

    // // positive
    // it(`should login user`, async () => {
    //   await wait(10);
    //
    //   const response = await agent
    //     .post(auth_login_uri)
    //     .send({
    //       loginOrEmail: userLogin01,
    //       password: userPassword,
    //     })
    //     .expect(200);
    //
    //   refreshTokenUser01 = response.headers['set-cookie'][0];
    //
    //   expect(refreshTokenUser01).toMatch(/^refreshToken=/);
    // }, 15000);

    // negative
    it(`should return 400 when trying to Confirm Password recovery with incorrect recoveryCode`, async () => {
      await agent
        .post(auth_newPassword_uri)
        .send({
          newPassword: 'string123',
          recoveryCode: randomUUID(),
        })
        .expect(400);
    });
    // negative
    it(`should return 400 when trying to Register in the system with incorrect login`, async () => {
      await agent
        .post(auth_registration_uri)
        .send({
          login: '',
          password: 'password123',
          email: 'some@gmail.com',
        })
        .expect(400);
    });

    it(`should return 400 when trying to Register in the system with incorrect login`, async () => {
      await agent
        .post(auth_registration_uri)
        .send({
          login: 'we', //minLength: 3
          password: 'password123',
          email: 'some@gmail.com',
        })
        .expect(400);
    });

    it(`should return 400 when trying to Register in the system with incorrect login`, async () => {
      await agent
        .post(auth_registration_uri)
        .send({
          login: lorem15, //maxLength: 10
          password: 'password123',
          email: 'some@gmail.com',
        })
        .expect(400);
    });

    it(`should return 400 when trying to Register in the system with incorrect password`, async () => {
      await agent
        .post(auth_registration_uri)
        .send({
          login: lorem10, //maxLength: 10
          password: '',
          email: 'some@gmail.com',
        })
        .expect(400);
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
          login: lorem10,
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
  });
  it(`should return 429 when More than 5 attempts from one IP-address during 10 seconds`, async () => {
    let i = 0;
    while (i < 10) {
      await agent
        .post(auth_registration_uri)
        .set('User-Agent', userAgent1)
        .set('x-real-ip', customIpAddress)
        .send(registrationInputDto)
        .expect(429);
      i++;
    }
  });

  afterAll(async () => {
    await app.close();
  });
});
