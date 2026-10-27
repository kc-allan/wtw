import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import type { Env } from '../config/env';
import { TurnstileService } from './turnstile.service';

@Injectable()
export class TurnstileGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService<Env, true>,
    private readonly turnstile: TurnstileService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) return true;

    const path = request.originalUrl.split('?')[0].replace(/^\/api\/v\d+/, '');
    if (path === '/auth/refresh' || path === '/auth/logout' || path === '/auth/google') {
      return true;
    }

    if (
      this.config.get('NODE_ENV', { infer: true }) !== 'production' &&
      this.config.get('TURNSTILE_DEV_BYPASS', { infer: true })
    ) return true;

    const action = expectedAction(request.method, path);
    const token = request.header('x-turnstile-token');
    if (!action || !token || token.length > 2048 || !(await this.turnstile.verify(token, action))) {
      throw new ForbiddenException('Please complete the security check and try again');
    }
    return true;
  }
}

function expectedAction(method: string, path: string): string | null {
  if (path === '/contact' && method === 'POST') return 'contact';
  if (path === '/auth/register' && method === 'POST') return 'register';
  if (path === '/auth/login' && method === 'POST') return 'login';
  if (path === '/events' && method === 'POST') return 'event_create';
  if (/^\/events\/[^/]+$/.test(path) && method === 'PATCH') return 'event_update';
  if (/^\/events\/[^/]+\/publish$/.test(path) && method === 'POST') return 'event_publish';
  if (/^\/events\/[^/]+\/unpublish$/.test(path) && method === 'POST') return 'event_unpublish';
  if (/^\/events\/[^/]+\/modules\/[^/]+$/.test(path) && method === 'PATCH') return 'event_module';
  if (/^\/events\/[^/]+\/ceremonies$/.test(path) && ['PUT', 'PATCH'].includes(method)) return 'ceremonies';
  if (/^\/events\/[^/]+\/ceremonies\/[^/]+$/.test(path) && method === 'PATCH') return 'ceremony_update';
  if (/^\/events\/[^/]+\/guests(?:\/bulk)?$/.test(path) && method === 'POST') return 'guest_add';
  if (/^\/events\/[^/]+\/guests\/[^/]+$/.test(path) && method === 'PATCH') return 'guest_update';
  if (/^\/events\/[^/]+\/guests\/[^/]+$/.test(path) && method === 'DELETE') return 'guest_delete';
  if (/^\/events\/[^/]+\/invitations\/(?:issue|send)$/.test(path) && method === 'POST') return 'invitation';
  if (/^\/events\/[^/]+\/invitations\/[^/]+$/.test(path) && method === 'DELETE') return 'invitation';
  if (/^\/events\/[^/]+\/games$/.test(path) && method === 'POST') return 'game_add';
  if (/^\/events\/[^/]+\/games\/[^/]+$/.test(path) && ['PATCH', 'DELETE'].includes(method)) return 'game_update';
  if (/^\/events\/[^/]+\/registry$/.test(path) && method === 'POST') return 'registry_update';
  if (/^\/events\/[^/]+\/registry\/[^/]+$/.test(path) && ['PATCH', 'DELETE'].includes(method)) return 'registry_update';
  if (/^\/events\/[^/]+\/media$/.test(path) && method === 'POST') return 'media_upload';
  if (/^\/events\/[^/]+\/media\/[^/]+$/.test(path) && ['PATCH', 'DELETE'].includes(method)) return 'media_update';
  if (/^\/e\/[^/]+\/rsvp$/.test(path) && method === 'POST') return 'rsvp';
  if (/^\/e\/[^/]+\/guest-list$/.test(path) && method === 'POST') return 'guest_join';
  if (/^\/e\/[^/]+\/registry\/[^/]+\/claim$/.test(path) && method === 'POST') return 'registry_claim';
  if (/^\/e\/[^/]+\/games\/[^/]+$/.test(path) && method === 'POST') return 'game_submit';
  return null;
}
