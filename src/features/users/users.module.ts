import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MailService } from '../mail/mail.service';

import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UsersQueryRepository } from './users.query.repository';
import { User, UserSchema } from './schemas/user.entity';
import { UsersController } from './users.controller';

import { IsUserAlreadyExistConstraint } from '@/shared/exceptions/decorators/unique-user.decorator';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    MailService,
    IsUserAlreadyExistConstraint,
  ],
  exports: [UsersService, UsersRepository, UsersQueryRepository, MailService],
})
export class UsersModule {}
