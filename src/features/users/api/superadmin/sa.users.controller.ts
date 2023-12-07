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
import { UserInputDto } from '../../dto/user-input-dto';
import { exceptionHandler } from '../../../../shared/exceptions/exception.handler';
import { ResultCode } from '../../../../shared/enums/result-code.enum';
import {
  userIDField,
  userNotFound,
} from '../../../../shared/constants/constants';
import { UserQuery } from '../../dto/user.query';

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
  async findUsers(@Query() query: UserQuery) {
    return this.usersQueryRepository.findUsers(query);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createUser(@Body() userInputDTO: UserInputDto) {
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
