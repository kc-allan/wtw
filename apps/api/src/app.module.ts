import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { JwtAuthGuard } from './core/auth/jwt-auth.guard';
import { validateEnv, type Env } from './core/config/env';
import { AllExceptionsFilter } from './core/http/all-exceptions.filter';
import { PrismaModule } from './core/prisma/prisma.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { AuthModule } from './modules/auth/auth.module';
import { EventTypesModule } from './modules/event-types/event-types.module';
import { EventsModule } from './modules/events/events.module';
import { ContactModule } from './modules/contact/contact.module';
import { GamesModule } from './modules/games/games.module';
import { GuestsModule } from './modules/guests/guests.module';
import { HealthModule } from './modules/health/health.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { MediaModule } from './modules/media/media.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PublicModule } from './modules/public/public.module';
import { RegistryModule } from './modules/registry/registry.module';
import { RsvpModule } from './modules/rsvp/rsvp.module';
import { ThemesModule } from './modules/themes/themes.module';
import { VendorsModule } from './modules/vendors/vendors.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv, cache: true }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => [
        {
          ttl: config.get('THROTTLE_TTL_SECONDS', { infer: true }) * 1000,
          limit: config.get('THROTTLE_LIMIT', { infer: true }),
        },
      ],
    }),
    PrismaModule,

    // Host-facing
    AuthModule,
    AccountsModule,
    EventsModule,
    GuestsModule,
    InvitationsModule,
    RsvpModule,

    // Catalogues
    EventTypesModule,
    ThemesModule,
    VendorsModule,

    // Guest-facing
    PublicModule,

    // Scaffolded ahead of their own product work
    RegistryModule,
    GamesModule,
    PaymentsModule,
    MediaModule,
    ContactModule,

    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
