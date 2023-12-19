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
  auth_logout_uri,
  auth_me_uri,
  auth_refreshToken_uri,
  basicAuthLogin,
  basicAuthPassword,
  security_devices_uri,
  set_cookie,
} from '../base/utils/constants/auth.constants';
import { wait } from '../base/utils/functions/wait';
import { deviceResponse, userProfileResponse } from '../base/utils/dto/dto';
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

    it(`should return 401 when trying to login user with incorrect password`, async () => {
      await agent
        .post(auth_login_uri)
        .send({
          loginOrEmail: userLogin01,
          password: randomUUID(),
        })
        .expect(401);
    });

    // positive
    it(`should login user01 5 times & create five devices`, async () => {
      await wait(10);
      let i = 0;
      let response;
      while (i < 5) {
        response = await agent
          .post(auth_login_uri)
          .send({
            loginOrEmail: userLogin01,
            password: userPassword,
          })
          .expect(200);
        i++;
      }

      accessTokenUser01 = response.body.accessToken;
      refreshTokenUser01 = response.headers[set_cookie][0];

      expect(accessTokenUser01).toBeDefined();
      expect(refreshTokenUser01).toContain('refreshToken=');

      await agent.delete(security_devices_uri);
    }, 15000);

    it(`should login user 1 5 times & receive 429 if more than 5 attempt in 10 sec`, async () => {
      let i = 0;
      while (i < 6) {
        await agent
          .post(auth_login_uri)
          .send({
            loginOrEmail: userLogin01,
            password: userPassword,
          })
          .expect(429);
        i++;
      }
    });

    it(`should login user 2`, async () => {
      await wait(10);
      await agent.delete(security_devices_uri);

      const response = await agent
        .post(auth_login_uri)
        .send({
          loginOrEmail: userLogin02,
          password: userPassword,
        })
        .expect(200);

      refreshTokenUser02 = response.headers['set-cookie'][0];
    }, 15000);
  });

  describe('Update tokens', () => {
    // negative
    it(`should return 401 when trying to update 
    token with incorrect refreshToken`, async () => {
      await agent
        .post(auth_refreshToken_uri)
        .set('Cookie', randomUUID())
        .expect(401);
    });

    it(`should update tokens and return 401 with 
    outdated refreshToken`, async () => {
      await wait(10);
      const response = await agent
        .post(auth_refreshToken_uri)
        .set('Cookie', refreshTokenUser01)
        .expect(200);

      expect(refreshTokenUser01).not.toBe(response.headers[set_cookie][0]);
      expect(accessTokenUser01).not.toBe(response.body.accessToken);

      // updating tokens with revoked refreshToken
      await agent
        .post(auth_refreshToken_uri)
        .set('Cookie', refreshTokenUser01)
        .expect(401);

      refreshTokenUser01 = response.headers[set_cookie][0];
      accessTokenUser01 = response.body.accessToken;
    }, 15000);
  });

  describe('user profile', () => {
    // negative
    it(`should return 401 with incorrect accessToken`, async () => {
      await agent
        .get(auth_me_uri)
        .auth(randomUUID(), { type: 'bearer' })
        .expect(401);
    });

    // positive
    it(`should return user profile`, async () => {
      const user = await agent
        .get(auth_me_uri)
        .auth(accessTokenUser01, { type: 'bearer' })
        .expect(200);
      expect(user.body).toEqual(userProfileResponse);
    });
  });

  describe('Get devices', () => {
    // negative
    it(`should return 401 with incorrect refreshToken`, async () => {
      await agent
        .get(security_devices_uri)
        .set('Cookie', randomUUID())
        .expect(401);
    });

    it(`should return 401 without refreshToken`, async () => {
      await agent.get(security_devices_uri).expect(401);
    });

    // positive
    it(`should return 4 devices`, async () => {
      const devices = await agent
        .get(security_devices_uri)
        .set('Cookie', refreshTokenUser01)
        .expect(200);

      expect(devices.body).toHaveLength(5);
      expect(devices.body[0]).toEqual(deviceResponse);

      devceId01 = devices.body[0].deviceId;
      devceId02 = devices.body[1].deviceId;
    });
  });

  describe('Delete devices', () => {
    // negative
    it(`should return 401 with incorrect refreshToken`, async () => {
      await agent.post(auth_logout_uri).set('Cookie', randomUUID()).expect(401);
    });

    it(`should return 401 without refreshToken`, async () => {
      await agent.post(auth_logout_uri).expect(401);
    });

    it(`should return 401 when trying to delete device by ID with incorrect refreshToken`, async () => {
      await agent
        .delete(security_devices_uri + devceId01)
        .set('Cookie', randomUUID())
        .expect(401);
    });

    it(`should return 401 when trying to delete device by ID without refreshToken`, async () => {
      await agent.delete(security_devices_uri + devceId01).expect(401);
    });

    it(`should return 401 when trying to delete all devices except current with incorrect refreshToken`, async () => {
      await agent
        .delete(security_devices_uri)
        .set('Cookie', randomUUID())
        .expect(401);
    });

    it(`should return 401 when trying to delete all devices except current without refreshToken`, async () => {
      await agent.delete(security_devices_uri).expect(401);
    });

    it(`should return 403 when trying to delete device by ID with token that not belong this user`, async () => {
      await agent
        .delete(security_devices_uri + devceId01)
        .set('Cookie', refreshTokenUser02)
        .expect(403);
    });

    it(`should return 404 when trying to delete device that do not exist`, async () => {
      await agent
        .delete(security_devices_uri + randomUUID())
        .set('Cookie', refreshTokenUser01)
        .expect(404);
    });

    // positive
    it(`should delete device by ID`, async () => {
      await agent
        .delete(security_devices_uri + devceId02)
        .set('Cookie', refreshTokenUser01)
        .expect(204);

      const devices = await agent
        .get(security_devices_uri)
        .set('Cookie', refreshTokenUser01)
        .expect(200);

      expect(devices.body).toHaveLength(4);
    });

    it(`should delete all devices except current`, async () => {
      await agent
        .delete(security_devices_uri)
        .set('Cookie', refreshTokenUser01)
        .expect(204);

      const devices = await agent
        .get(security_devices_uri)
        .set('Cookie', refreshTokenUser01)
        .expect(200);

      expect(devices.body).toHaveLength(1);
    });

    it(`should delete device (logout)`, async () => {
      await agent
        .post(auth_logout_uri)
        .set('Cookie', refreshTokenUser01)
        .expect(204);
      await agent
        .get(security_devices_uri)
        .set('Cookie', refreshTokenUser01)
        .expect(401);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
