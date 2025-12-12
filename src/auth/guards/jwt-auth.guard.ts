import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    console.log(
      '🔐 JwtAuthGuard - Authorization header:',
      authHeader ? 'EXISTS' : 'MISSING',
    );

    if (authHeader) {
      console.log('🔐 Token preview:', authHeader.substring(0, 50) + '...');
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    console.log('🔐 JwtAuthGuard - handleRequest called');
    console.log('   Error:', err?.message || 'none');
    console.log('   User:', user ? `${user.email} (${user.role})` : 'null');
    console.log('   Info:', info?.message || info || 'none');

    if (err || !user) {
      console.log('❌ JWT Authentication FAILED');
      throw err || new UnauthorizedException('Unauthorized');
    }

    console.log('✅ JWT Authentication SUCCESS');
    return user;
  }
}
