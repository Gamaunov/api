import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserIdDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.userId;
  },
);
