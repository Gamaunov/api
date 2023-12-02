import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

import { SendPasswordRecoveryUseCase } from './application/use-cases/send-pass-recovery-mail.use-case';
import { SendRegistrationMailUseCase } from './application/use-cases/send-registration-mail.use-case';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        port: 465,
        host: 'smtp.gmail.com',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASS,
        },
        secure: true,
      },
      defaults: {
        from: '"Admin" <process.env.EMAIL>',
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [SendRegistrationMailUseCase, SendPasswordRecoveryUseCase],
})
export class MailModule {}
