import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UserRole } from 'generated/prisma/enums';
import { CurrentUserType } from 'src/types/user';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.session.user as CurrentUserType;

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Access denied: requires roles [${requiredRoles.join(', ')}], but you have role ${user.role}`,
      );
    }

    return true;
  }
}
