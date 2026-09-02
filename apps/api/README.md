# Worth The Wait — API

NestJS service behind the Worth The Wait platform. Hosts plan events; guests
open a link and respond. Nothing about a guest requires an account.

## The idea the code is built around

An event's **type** decides which **modules** it may run. Modules are the unit
of functionality — RSVP, registry, timeline, games — and every event is
assembled from them rather than from type-specific code.

```
Account
  └── Event ── type ── the modules it may enable
        ├── EventModule (enabled, position, config)
        ├── Guest ── Invitation (token) ── RsvpResponse
        ├── RegistryItem ── RegistryClaim
        └── GameInstance ── GameSubmission
```

The type-to-module map lives in `packages/shared/src/event-types.ts`, and each
module's settings schema in `event-modules.ts`. Adding an event type is a data
change there plus themes in the seed — no new tables and no new endpoints. That
is also what makes premium tiers cheap: a module carries a `tier`, so gating one
is a flag rather than a feature build.

`EventModulesService` is the only place that decides whether a module may be
switched on, so those rules cannot drift between callers. A birthday genuinely
cannot enable a gift registry:

```
PATCH /events/:id/modules/registry  {"enabled": true}
→ 400 "Gift registry is not available for Birthday events"
```

## Running it

```bash
pnpm setup                    # from the repo root: install, build shared, start Postgres, generate client
pnpm --filter @wtw/api prisma:migrate
pnpm --filter @wtw/api db:seed
pnpm dev:api
```

Docs at `http://localhost:4100/api/docs`. Copy `.env.example` to `.env` first;
the defaults match the `docker-compose.yml` database on port 5434.

The seed prints working guest invitation links, and signs in as
`demo@worththewait.africa` / `Demo1234!`.

## Layout

```
src/
  core/         config, Prisma, auth, HTTP plumbing
  common/       slug and pagination helpers
  modules/
    auth/ accounts/               hosts and workspaces
    events/                       events + the module registry
    guests/ invitations/ rsvp/    the guest pipeline
    event-types/ themes/          catalogues
    public/                       everything a guest can reach
    registry/ games/ vendors/     scaffolded
    payments/ media/              scaffolded
prisma/
  schema.prisma
  seed.ts, seed-data/             119 themes, 8 sample vendors
```

## What is built and what is not

Working end to end: authentication, workspaces, events, the module registry,
the theme catalogue, guests, invitations and RSVP, plus vendor search.

Scaffolded — real tables, module gating and routes, but thin logic: registry
claims, baby shower games, payments and media. Each is marked in its service.

## Notes for whoever picks this up

- **Guest authorisation is the invitation token**, hashed in the database. The
  raw token is returned once, by `POST /events/:id/invitations/issue`, and is
  not recoverable afterwards — reissuing mints a new one and invalidates the old.
- **Sending is stubbed.** `InvitationSender` logs instead of delivering; bind a
  WhatsApp or SMS provider to that token in `invitations.module.ts`.
- **Prisma 7** takes its migrate URL from `prisma.config.ts` and its runtime
  connection from the `pg` driver adapter in `PrismaService`. The `url` field is
  no longer allowed in `schema.prisma`.
- **Nest 12 is ESM-only.** The build still emits CommonJS, which works because
  Node 24 supports `require(esm)`. Tests run on Vitest for the same reason —
  Jest's sandbox cannot load Nest. Going ESM-native is a reasonable future step.
- **Enums are declared twice**, in `schema.prisma` and in `@wtw/shared`, because
  Prisma cannot import them. `src/core/prisma/enums.ts` asserts at compile time
  that the two sets match, so drift breaks the build rather than production.
