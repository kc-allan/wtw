# Worth The Wait

Plan. Celebrate. Remember.

A pnpm workspace holding the marketing and event site, the API behind it, and
the domain contracts they share.

```
apps/
  web/        Next.js 16 — the public site
  api/        NestJS 12 — the platform API
packages/
  shared/     event types, module contracts and their schemas
```

## Getting started

```bash
pnpm setup      # install, build shared, start Postgres, generate the Prisma client
pnpm db:migrate
pnpm db:seed

pnpm dev:api    # http://localhost:4100/api/v1  (docs at /api/docs)
pnpm dev:web    # http://localhost:3000
pnpm build      # build shared, API, and web for production
```

`pnpm setup` starts Postgres in Docker on port **5434**, chosen to stay clear of
a local Postgres on 5432.

## Why the shared package exists

`@wtw/shared` holds the vocabulary both apps need: the event types, the modules
each type may enable, and the zod schema for every module's settings. The API
validates against those schemas and the web app can build its forms from the
same definitions, so the two cannot disagree about what a wedding is.

See `apps/api/README.md` for the architecture and current state of each module.
