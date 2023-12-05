import { userEmail01, userLogin01 } from '../constants/users.constants';

export const userProfileResponse = {
  email: userEmail01,
  login: userLogin01,
  userId: expect.any(String),
};

export const deviceResponse = {
  ip: expect.any(String),
  title: expect.any(String),
  lastActiveDate: expect.any(String),
  deviceId: expect.any(String),
};
