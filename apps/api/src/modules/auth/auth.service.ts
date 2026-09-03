import {
  ConflictException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import type { Env } from '../../core/config/env';
import { generateRawToken, hashToken } from '../../core/crypto/tokens';
import { PrismaService } from '../../core/prisma/prisma.service';
import { looksLikeEmail, normalisePhone } from '../../common/phone';
import { slugify, uniqueSlug } from '../../common/slug';
import { GoogleIdentityService } from './google-identity.service';
import type { GoogleAuthInput, LoginInput, RegisterInput } from './auth.schemas';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult extends AuthTokens {
  user: { id: string; email: string; name: string };
}

/**
 * A stand-in for someone who signed up without giving a name — the local part
 * of their email, which is nearly always what they would have typed anyway.
 */
function nameFromEmail(email: string): string {
  const local = email.slice(0, email.indexOf('@')).replace(/[._-]+/g, ' ').trim();
  if (local === '') return 'Host';
  return local.charAt(0).toUpperCase() + local.slice(1);
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<Env, true>,
    private readonly google: GoogleIdentityService,
  ) {}

  async register(input: RegisterInput): Promise<AuthResult> {
    const name = input.name ?? nameFromEmail(input.email);

    const existing = await this.prisma.user.findFirst({
      where: input.phone
        ? { OR: [{ email: input.email }, { phone: input.phone }] }
        : { email: input.email },
      select: { email: true },
    });
    if (existing) {
      throw new ConflictException(
        existing.email === input.email
          ? 'An account with that email already exists'
          : 'An account with that phone number already exists',
      );
    }

    const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
    const user = await this.createUserWithWorkspace({
      email: input.email,
      name,
      passwordHash,
      phone: input.phone,
    });

    return { user, ...(await this.issueTokens(user.id, user.email)) };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.findByIdentifier(input.identifier);

    // One reply whether the account is unknown, has no password, or the
    // password is wrong, so none of the three can be told apart from outside.
    if (
      !user?.passwordHash ||
      !(await argon2.verify(user.passwordHash, input.password))
    ) {
      throw new UnauthorizedException('Those details do not match an account');
    }

    return {
      user: { id: user.id, email: user.email, name: user.name },
      ...(await this.issueTokens(user.id, user.email)),
    };
  }

  /**
   * Signs in through Google, joining up with an existing account when the
   * verified Google email already belongs to one — so someone who signed up
   * with a password does not end up with a second, separate workspace.
   */
  async signInWithGoogle(input: GoogleAuthInput): Promise<AuthResult> {
    if (!this.google.isConfigured) {
      throw new ServiceUnavailableException('Google sign-in is not available');
    }

    const profile = await this.google.exchange(input.code, input.redirectUri);

    const identity = await this.prisma.userIdentity.findUnique({
      where: {
        provider_providerUserId: { provider: 'google', providerUserId: profile.id },
      },
      select: { user: { select: { id: true, email: true, name: true } } },
    });
    if (identity) {
      return { user: identity.user, ...(await this.issueTokens(identity.user.id, identity.user.email)) };
    }

    const byEmail = await this.prisma.user.findUnique({
      where: { email: profile.email },
      select: { id: true, email: true, name: true },
    });

    const user =
      byEmail ??
      (await this.createUserWithWorkspace({
        email: profile.email,
        name: profile.name ?? nameFromEmail(profile.email),
        // No password: this account signs in through Google until it sets one.
        passwordHash: null,
      }));

    await this.prisma.userIdentity.create({
      data: { userId: user.id, provider: 'google', providerUserId: profile.id },
    });

    return { user, ...(await this.issueTokens(user.id, user.email)) };
  }

  async refresh(rawRefreshToken: string): Promise<AuthTokens> {
    const tokenHash = hashToken(rawRefreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true, email: true } } },
    });

    if (!stored || stored.revokedAt || stored.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token is no longer valid');
    }

    // Rotate: the presented token is spent even if the client never sees the reply.
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens(stored.user.id, stored.user.email);
  }

  async logout(rawRefreshToken: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: hashToken(rawRefreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /** Resolves the one field the sign-in form offers to an account. */
  private async findByIdentifier(identifier: string) {
    if (looksLikeEmail(identifier)) {
      return this.prisma.user.findUnique({ where: { email: identifier.toLowerCase() } });
    }
    const phone = normalisePhone(identifier);
    return phone === null ? null : this.prisma.user.findUnique({ where: { phone } });
  }

  private createUserWithWorkspace(data: {
    email: string;
    name: string;
    passwordHash: string | null;
    phone?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data,
        select: { id: true, email: true, name: true },
      });

      // Every host starts with a personal workspace; professional accounts
      // reuse the same tables with additional members.
      const slug = await uniqueSlug(slugify(data.name) || 'account', (candidate) =>
        tx.account.findUnique({ where: { slug: candidate } }).then(Boolean),
      );
      await tx.account.create({
        data: {
          name: data.name,
          slug,
          members: { create: { userId: created.id, role: 'owner' } },
        },
      });

      return created;
    });
  }

  private async issueTokens(userId: string, email: string): Promise<AuthTokens> {
    const accessToken = await this.jwt.signAsync(
      { sub: userId, email },
      {
        secret: this.config.get('JWT_ACCESS_SECRET', { infer: true }),
        expiresIn: this.config.get('JWT_ACCESS_TTL', {
          infer: true,
        }) as JwtSignOptions['expiresIn'],
      },
    );

    const refreshToken = generateRawToken();
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hashToken(refreshToken),
        expiresAt: this.refreshExpiry(),
      },
    });

    return { accessToken, refreshToken };
  }

  private refreshExpiry(): Date {
    const ttl = this.config.get('JWT_REFRESH_TTL', { infer: true });
    const match = /^(\d+)([smhd])$/.exec(ttl);
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    };
    const milliseconds = match
      ? Number(match[1]) * multipliers[match[2]]
      : 30 * multipliers.d;
    return new Date(Date.now() + milliseconds);
  }
}
