import { randomUUID } from 'crypto';

export const auth_login_uri = '/auth/login/';
export const auth_newPassword_uri = '/auth/new-password/';
export const auth_registration_uri = '/auth/registration/';
export const auth_registrationEmailResending_uri =
  '/auth/registration-email-resending/';
export const auth_logout_uri = '/auth/logout/';
export const auth_refreshToken_uri = '/auth/refresh-token/';
export const auth_me_uri = '/auth/me/';
export const security_devices_uri = '/security/devices/';

export const basicAuthLogin = 'admin';
export const basicAuthPassword = 'qwerty';
export const set_cookie = 'set-cookie';

export const someSiteURl = 'https://some-site.com';
export const updatedSomeSiteURl = 'https://some-updated-site.com';

export const userAgent1 =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36';
export const userAgent2 =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:94.0) Gecko/20100101 Firefox/94.0';
export const userAgent3 =
  'Mozilla/5.0 (Linux; Android 10; SM-G960F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.86 Mobile App Android';
export const userAgent4 =
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
export const userAgent5 =
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

export const customIpAddress = '7';

export const registrationInputDto = {
  login: 'login1',
  password: 'password123',
  email: 'some@gmail.com',
};

export const invalidAccessToken = `accessToken=${randomUUID()}`;
export const invalidRefreshToken = `refreshToken=${randomUUID()}`;
export const expiredAccessToken = `accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NTgwMjI1MjA1MmI4ZTJjZGUwNzgxYzIiLCJpYXQiOjE3MDI4OTYyMTAsImV4cCI6MTcwMjg5OTgxMH0.DiIAJgMRXzrVwdWFSBSh2PZzI7L-1HQUJk6F-1w7C1U`;
