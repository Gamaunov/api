import { CommandBus } from '@nestjs/cqrs';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { BlogsQueryRepository } from '../../infrastructure/blogs.query.repository';
import { BasicAuthGuard } from '../../../auth/guards/basic-auth.guard';
import { BlogQuery } from '../../dto/blog-query';
import { Role } from '../../../../shared/enums/roles.enum';

@Controller('sa/blogs')
export class SuperAdminBlogsController {
  constructor(
    private commandBus: CommandBus,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  async findBlogs(@Query() query: BlogQuery) {
    const role = Role.SUPER_ADMIN;
    return this.blogsQueryRepository.findBlogs(query, role);
  }
}
