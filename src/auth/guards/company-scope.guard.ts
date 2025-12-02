import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '../../user/enums/user-role.enum';

@Injectable()
export class CompanyScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const params = request.params;

    // SuperAdmin can access everything
    if (user.role === UserRole.SuperAdmin) {
      return true;
    }

    // If accessing a company-scoped resource, check if user belongs to that company
    if (params.companyId && params.companyId !== user.companyId) {
      throw new ForbiddenException(
        'You do not have access to this company resource',
      );
    }

    return true;
  }
}
