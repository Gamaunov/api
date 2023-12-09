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
import { ApiBasicAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

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

@ApiTags('users')
@Controller('users')
export class SuperAdminUsersController {
  constructor(
    private commandBus: CommandBus,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Returns all users. Admins only',
  })
  @ApiBasicAuth('Basic')
  @UseGuards(BasicAuthGuard)
  async findUsers(@Query() query: UserQueryModel) {
    return this.usersQueryRepository.findUsers(query);
  }

  @Post()
  @ApiOperation({
    summary: 'Add new user to the system. Admins only',
  })
  @ApiBasicAuth('Basic')
  @UseGuards(BasicAuthGuard)
  async createUser(@Body() userInputModel: UserInputModel) {
    const userId = await this.commandBus.execute(
      new UserCreateCommand(userInputModel),
    );

    return this.usersQueryRepository.findUser(userId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete user specified by id. Admins only',
  })
  @ApiBasicAuth('Basic')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async deleteUser(@Param('id') userId: string) {
    const result = await this.commandBus.execute(new UserDeleteCommand(userId));

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, userNotFound, userIDField);
    }

    return result;
  }
}
