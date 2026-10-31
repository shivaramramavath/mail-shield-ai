import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Optional guard for internal/admin routes. It is intentionally not applied
 * globally because the public email-analysis endpoints are login-free.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.config.get<string>('INTERNAL_API_KEY');
    if (!expected) {
      throw new UnauthorizedException('Internal API key is not configured.');
    }

    const request = context.switchToHttp().getRequest();
    const supplied = request.headers['x-internal-api-key'];

    if (typeof supplied !== 'string' || supplied !== expected) {
      throw new UnauthorizedException('Invalid internal API key.');
    }
    return true;
  }
}
