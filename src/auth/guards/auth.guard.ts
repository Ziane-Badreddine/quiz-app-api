import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext) {
    const req: Request = ctx.switchToHttp().getRequest();

    if (!req.session || !req.session.user)
      throw new UnauthorizedException('Not logged in yet');

    return true;
  }
}
