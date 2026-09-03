import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../../core/config/env';

const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const USERINFO_ENDPOINT = 'https://openidconnect.googleapis.com/v1/userinfo';

export interface GoogleProfile {
  /** Google's own permanent id for the person; their email may change. */
  id: string;
  email: string;
  name?: string;
}

interface TokenResponse {
  access_token?: string;
}

interface UserInfoResponse {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
}

/**
 * Turns an authorization code into a Google profile. The exchange happens
 * server side so the client secret never leaves the API, and the profile is
 * read from Google's userinfo endpoint rather than from the returned id token,
 * which saves verifying a signature to learn what Google will tell us anyway.
 */
@Injectable()
export class GoogleIdentityService {
  constructor(private readonly config: ConfigService<Env, true>) {}

  /** False until the credentials exist, which is what hides the button. */
  get isConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret);
  }

  get clientId(): string | undefined {
    return this.config.get('GOOGLE_CLIENT_ID', { infer: true });
  }

  private get clientSecret(): string | undefined {
    return this.config.get('GOOGLE_CLIENT_SECRET', { infer: true });
  }

  async exchange(code: string, redirectUri: string): Promise<GoogleProfile> {
    const clientId = this.clientId;
    const clientSecret = this.clientSecret;
    if (!clientId || !clientSecret) {
      throw new UnauthorizedException('Google sign-in is not available');
    }

    const tokenResponse = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    if (!tokenResponse.ok) {
      throw new UnauthorizedException('Google did not accept that sign-in');
    }

    const { access_token: accessToken } = (await tokenResponse.json()) as TokenResponse;
    if (!accessToken) {
      throw new UnauthorizedException('Google did not accept that sign-in');
    }

    const profileResponse = await fetch(USERINFO_ENDPOINT, {
      headers: { authorization: `Bearer ${accessToken}` },
    });
    if (!profileResponse.ok) {
      throw new UnauthorizedException('Could not read that Google account');
    }

    const profile = (await profileResponse.json()) as UserInfoResponse;
    // An unverified address would let someone claim an account by signing up
    // for Google with an email they do not control.
    if (!profile.sub || !profile.email || profile.email_verified !== true) {
      throw new UnauthorizedException('That Google account has no verified email');
    }

    return { id: profile.sub, email: profile.email.toLowerCase(), name: profile.name };
  }
}
