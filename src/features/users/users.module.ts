import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';

import { IsUserAlreadyExistConstraint } from '../../infrastructure/decorators/unique-user.decorator';

import { UserCreateUseCase } from './api/superadmin/application/use-cases/user-create.use-case';
import { UserDeleteUseCase } from './api/superadmin/application/use-cases/user-delete.use-case';
import { UsersQueryRepository } from './api/superadmin/infrastructure/users.query.repository';
import { UsersRepository } from './infrastructure/users.repository';
import { User, UserSchema } from './domain/user.entity';
import { SuperAdminUsersController } from './api/superadmin/sa.users.controller';

const useCases = [UserCreateUseCase, UserDeleteUseCase];
const repositories = [UsersRepository, UsersQueryRepository];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    CqrsModule,
  ],
  controllers: [SuperAdminUsersController],
  providers: [...useCases, ...repositories, IsUserAlreadyExistConstraint],
})
export class UsersModule {}
