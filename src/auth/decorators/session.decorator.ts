import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Session = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req: Request = ctx.switchToHttp().getRequest();
    return req.session;
  },
);
