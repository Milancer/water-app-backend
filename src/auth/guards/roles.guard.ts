import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../user/enums/user-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    console.log('🔒 RolesGuard - Required roles:', requiredRoles);

    if (!requiredRoles) {
      console.log('✅ No roles required, allowing access');
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    console.log('👤 User role:', user?.role);
    const hasAccess = requiredRoles.some((role) => user.role === role);
    console.log(hasAccess ? '✅ Access granted' : '❌ Access denied');
    return hasAccess;
  }
}
