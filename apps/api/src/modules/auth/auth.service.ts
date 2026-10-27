import {
  ConflictException,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import * as argon2 from 'argon2';
import { PlanKey } from '@wtw/shared';
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
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
}

export interface AuthResult extends AuthTokens {
  user: { id: string; email: string; name: string };
}

/** Most generous first, so picking the best of several is a find. */
const PLAN_ORDER = [PlanKey.PROFESSIONAL, PlanKey.CELEBRATION, PlanKey.FREE];

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
export class AuthService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AuthService.name);
  private replayCleanupTimer: NodeJS.Timeout | undefined;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<Env, true>,
    private readonly google: GoogleIdentityService,
  ) {}

  onModuleInit(): void {
    this.replayCleanupTimer = setInterval(() => {
      void this.prisma.refreshToken.updateMany({
        where: { replayExpiresAt: { lte: new Date() } },
        data: { replayTokensCiphertext: null, replayExpiresAt: null },
      }).catch(() => this.logger.warn('Could not clear expired refresh replay data'));
    }, 15_000);
    this.replayCleanupTimer.unref();
  }

  onModuleDestroy(): void {
    if (this.replayCleanupTimer) clearInterval(this.replayCleanupTimer);
  }

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
    return this.prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<{ id: string }[]>`
        SELECT "id" FROM "refresh_tokens" WHERE "tokenHash" = ${tokenHash} FOR UPDATE
      `;
      if (!rows[0]) throw new UnauthorizedException('Refresh token is no longer valid');

      const stored = await tx.refreshToken.findUnique({
        where: { id: rows[0].id },
        include: { user: { select: { id: true, email: true } } },
      });
      if (!stored) throw new UnauthorizedException('Refresh token is no longer valid');

      const now = Date.now();
      if (stored.revokedAt) {
        if (
          !stored.replayTokensCiphertext ||
          !stored.replayExpiresAt ||
          stored.replayExpiresAt.getTime() <= now
        ) {
          throw new UnauthorizedException('Refresh token is no longer valid');
        }
        return this.decryptReplayTokens(stored.replayTokensCiphertext);
      }
      if (stored.expiresAt.getTime() <= now) {
        throw new UnauthorizedException('Refresh token is no longer valid');
      }

      const tokens = await this.issueTokensIn(tx, stored.user.id, stored.user.email);
      await tx.refreshToken.update({
        where: { id: stored.id },
        data: {
          revokedAt: new Date(now),
          replayTokensCiphertext: this.encryptReplayTokens(tokens),
          replayExpiresAt: new Date(now + 30_000),
        },
      });
      return tokens;
    });
  }

  async logout(rawRefreshToken: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: hashToken(rawRefreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * The signed-in host, with the plan their workspace is on. A host who
   * belongs to several takes the most generous of them, so being added to a
   * professional workspace never costs them what they already had.
   */
  async me(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatarUrl: true,
        memberships: { select: { account: { select: { plan: true } } } },
      },
    });

    const { memberships, ...rest } = user;
    const plans = memberships.map((membership) => membership.account.plan);
    const best =
      PLAN_ORDER.find((plan) => plans.includes(plan)) ?? PlanKey.FREE;

    return { ...rest, plan: best };
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

    const decoded = this.jwt.decode(accessToken);
    if (!decoded || typeof decoded.exp !== 'number') {
      throw new ServiceUnavailableException('Could not determine session expiry');
    }
    const refreshToken = generateRawToken();
    const refreshTokenExpiresAt = this.refreshExpiry();
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hashToken(refreshToken),
        expiresAt: refreshTokenExpiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt: decoded.exp * 1000,
      refreshTokenExpiresAt: refreshTokenExpiresAt.getTime(),
    };
  }

  private async issueTokensIn(
    tx: Prisma.TransactionClient,
    userId: string,
    email: string,
  ): Promise<AuthTokens> {
    const accessToken = await this.jwt.signAsync(
      { sub: userId, email },
      {
        secret: this.config.get('JWT_ACCESS_SECRET', { infer: true }),
        expiresIn: this.config.get('JWT_ACCESS_TTL', { infer: true }) as JwtSignOptions['expiresIn'],
      },
    );
    const decoded = this.jwt.decode(accessToken);
    if (!decoded || typeof decoded.exp !== 'number') {
      throw new ServiceUnavailableException('Could not determine session expiry');
    }

    const refreshToken = generateRawToken();
    const refreshTokenExpiresAt = this.refreshExpiry();
    await tx.refreshToken.create({
      data: { userId, tokenHash: hashToken(refreshToken), expiresAt: refreshTokenExpiresAt },
    });
    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt: decoded.exp * 1000,
      refreshTokenExpiresAt: refreshTokenExpiresAt.getTime(),
    };
  }

  private encryptReplayTokens(tokens: AuthTokens): string {
    const key = createHash('sha256')
      .update(this.config.get('JWT_REFRESH_REPLAY_SECRET', { infer: true }))
      .digest();
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([
      cipher.update(JSON.stringify(tokens), 'utf8'),
      cipher.final(),
    ]);
    return [iv, cipher.getAuthTag(), encrypted]
      .map((part) => part.toString('base64url'))
      .join('.');
  }

  private decryptReplayTokens(value: string): AuthTokens {
    try {
      const [ivText, tagText, payloadText] = value.split('.');
      if (!ivText || !tagText || !payloadText) throw new Error('Malformed replay token');
      const key = createHash('sha256')
        .update(this.config.get('JWT_REFRESH_REPLAY_SECRET', { infer: true }))
        .digest();
      const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivText, 'base64url'));
      decipher.setAuthTag(Buffer.from(tagText, 'base64url'));
      const plaintext = Buffer.concat([
        decipher.update(Buffer.from(payloadText, 'base64url')),
        decipher.final(),
      ]).toString('utf8');
      const tokens: unknown = JSON.parse(plaintext);
      if (
        typeof tokens !== 'object' || tokens === null ||
        typeof (tokens as AuthTokens).accessToken !== 'string' ||
        typeof (tokens as AuthTokens).refreshToken !== 'string' ||
        typeof (tokens as AuthTokens).accessTokenExpiresAt !== 'number' ||
        typeof (tokens as AuthTokens).refreshTokenExpiresAt !== 'number'
      ) throw new Error('Malformed replay token');
      return tokens as AuthTokens;
    } catch {
      throw new UnauthorizedException('Refresh token is no longer valid');
    }
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
