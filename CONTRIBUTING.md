# Contributing to StayHub

## Branching and commits

- Use short-lived feature branches from `main` (or your default branch).
- Prefer [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `docs:`, etc.) so changelogs stay readable.

## Local development

```bash
npm install
docker compose up -d   # optional: Postgres + Mongo
npx prisma migrate deploy --schema apps/api/prisma/schema.prisma
npm run db:seed
npm run dev
```

## Required checks before opening a PR

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

For UI changes that touch routing or layouts, also run `npm run test:e2e` from `apps/web` (Playwright) when practical.

## Database changes

- Add or edit Prisma migrations under `apps/api/prisma/migrations`.
- Never commit real `DATABASE_URL` values or production secrets.

## Security checklist (quick)

- Validate all new HTTP inputs with **Zod** (prefer schemas in `packages/shared`).
- Do not log access tokens, refresh tokens, or payment secrets.
- Rate-limit sensitive unauthenticated routes (auth patterns live in `apps/api/src/modules/auth/auth.routes.ts` and `apps/api/src/app.ts`).

## Questions

If requirements are ambiguous, open a discussion or issue before large refactors.
