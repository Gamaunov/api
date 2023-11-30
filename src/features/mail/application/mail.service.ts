import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendPasswordRecoveryMail(
    login: string,
    email: string,
    recoveryCode: string,
  ) {
    const url = `https://somesite.com/password-recovery?recoveryCode=${recoveryCode}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Password recovery',
      template: './password-recovery',
      context: {
        login: login,
        url,
      },
    });
  }
}
