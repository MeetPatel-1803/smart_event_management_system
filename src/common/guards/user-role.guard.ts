import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthenticatedRequest } from './auth.guard';
import { Reflector } from '@nestjs/core';
import { Role } from '../decorators/user-role.decorator';
import { CONSTANTS } from '../constants/app.constants';
import { ApiError } from 'src/shared/response/apiError.service';
import { Messages } from 'src/shared/messages/messages';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // No @Roles() decorator on this route → allow (public/authenticated-only route)
    if (
      !requiredRoles ||
      requiredRoles.length === 0 ||
      request.user.role === CONSTANTS.ROLES.ADMIN
    ) {
      return true;
    }

    if (!request.user) {
      throw ApiError.unauthorized();
    }

    const allowedRoles = Object.values(requiredRoles);

    const hasRole = allowedRoles.includes(request.user.role);
    if (!hasRole) {
      throw ApiError.forbidden(Messages.DONT_HAVE_PERMISSION);
    }

    return true;
  }
}
