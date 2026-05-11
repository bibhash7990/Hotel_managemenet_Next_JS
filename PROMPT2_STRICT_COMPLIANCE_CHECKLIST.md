# Prompt 2 — Strict Compliance Checklist (Reusable)

Use this checklist at the end of every phase to ensure full compliance with Prompt 2 in `Hotel_Booking_System_Cursor_Prompt.md`.

---

## 1) Phase Boundary Control (Mandatory)

- [ ] Confirm active phase number (`N`) before coding.
- [ ] Implement only `PLAN.md` items for phase `N`.
- [ ] Do **not** start phase `N+1` work in the same run.
- [ ] After phase completion, post summary and **stop**.
- [ ] Wait for explicit user message: `"proceed to Phase N+1"` before continuing.

Hard fail conditions:
- Any code/docs for phase `N+1` created before explicit proceed.
- Phase marked complete without pause for user approval.

---

## 2) Implementation Completeness (No stubs/TODOs)

- [ ] Every planned item for phase `N` is fully implemented.
- [ ] No placeholder behavior or deferred core logic.
- [ ] No `TODO`, `FIXME`, or "implement later" markers in source files for delivered scope.
- [ ] Error handling exists for all non-trivial I/O or auth/payment paths touched.

---

## 3) Verification Gate (Required)

Run from repo root:

```bash
npm run lint
npm run typecheck
npm run test
```

- [ ] `lint` passes with zero errors.
- [ ] `typecheck` passes with zero errors.
- [ ] `test` passes.
- [ ] Any failures were fixed before phase was declared complete.

Note: Prompt text says `pnpm`; this repo uses npm workspaces, so npm commands above are the canonical equivalent.

---

## 4) PLAN.md Update Discipline

- [ ] Only phase `N` checkboxes updated in `PLAN.md`.
- [ ] Boxes reflect reality (no pre-checked incomplete work).
- [ ] If this is a re-audit, record verification date and keep checkbox truthfulness unchanged.

---

## 5) Required Phase Summary Output

Create `PHASE_N_SUMMARY.md` with all sections below:

- [ ] Phase scope (what was expected from plan)
- [ ] **Files created** (explicit list)
- [ ] Files modified (explicit list)
- [ ] Key design/implementation decisions
- [ ] Deviations from plan + justification
- [ ] Verification command results
- [ ] How to verify locally (step-by-step)
- [ ] Explicit stop statement: waiting for `"proceed to Phase N+1"`

---

## 6) Copy/Paste Summary Template

```md
# Phase N — <Phase Name>

## Scope (from PLAN.md)
- ...

## Files created
- `path/to/new-file-1`
- `path/to/new-file-2`

## Files modified
- `path/to/updated-file-1`
- `path/to/updated-file-2`

## Decisions made
- ...

## Deviations from plan (with justification)
- ...

## Verification gate
- `npm run lint` — pass/fail
- `npm run typecheck` — pass/fail
- `npm run test` — pass/fail

## How to verify locally
1. ...
2. ...
3. ...

## Status
Phase N complete. Stopping here and waiting for your explicit `"proceed to Phase N+1"`.
```

---

## 7) Quick Reviewer Pass/Fail

Phase `N` is compliant only if all are true:
- [ ] Implementation complete for phase `N` only
- [ ] Required gate commands all pass
- [ ] `PLAN.md` checkboxes accurately updated
- [ ] `PHASE_N_SUMMARY.md` includes all required sections
- [ ] Work stopped pending explicit proceed
