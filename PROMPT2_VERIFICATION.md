# Prompt 2 — Verification commands (this repo)

The master prompt’s **Prompt 2** references `pnpm lint`, `pnpm typecheck`, `pnpm test`. This monorepo uses **npm workspaces**. Use the following from the repository root (`d:\New folder`):

## Required gate (after each phase)

```bash
npm run lint
npm run typecheck
npm run test
```

## Recommended before merge / release

```bash
npm run build
```

## Optional end-to-end (Playwright)

```bash
npm run test:e2e
```

Requires a running dev server (the `@hotel/web` Playwright config starts one when appropriate).

## Phase completion checklist (Prompt 2)

1. Implement every item for the active phase in `PLAN.md` §7 (no TODO stubs in delivered code).
2. Run the **Required gate** commands above; fix all failures.
3. Update `PLAN.md` checkboxes for that phase (or add a Prompt 2 verification log if items were already complete and you re-audited).
4. Add `PHASE_N_SUMMARY.md` at repo root with: files touched, decisions, deviations, how to verify locally.
5. Stop and wait for explicit **“proceed to Phase N+1”** before starting the next phase.
