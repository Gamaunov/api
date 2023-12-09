import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { BasicAuthGuard } from '../../../auth/guards/basic-auth.guard';
import { UserInputModel } from '../models/user-input-model';
import { exceptionHandler } from '../../../../infrastructure/exception-filters/exception.handler';
import { ResultCode } from '../../../../base/enums/result-code.enum';
import {
  userIDField,
  userNotFound,
} from '../../../../base/constants/constants';
import { UserQueryModel } from '../models/user.query.model';

import { UsersQueryRepository } from './infrastructure/users.query.repository';
import { UserCreateCommand } from './application/use-cases/user-create.use-case';
import { UserDeleteCommand } from './application/use-cases/user-delete.use-case';

@Controller('users')
export class SuperAdminUsersController {
  constructor(
    private commandBus: CommandBus,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  async findUsers(@Query() query: UserQueryModel) {
    return this.usersQueryRepository.findUsers(query);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createUser(@Body() userInputDTO: UserInputModel) {
    const userId = await this.commandBus.execute(
      new UserCreateCommand(userInputDTO),
    );

    return this.usersQueryRepository.findUser(userId);
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteUser(@Param('id') userId: string) {
    const result = await this.commandBus.execute(new UserDeleteCommand(userId));

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, userNotFound, userIDField);
    }

    return result;
  }
}
