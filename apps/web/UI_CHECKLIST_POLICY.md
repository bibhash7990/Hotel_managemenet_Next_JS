# UI Checklist Policy

This file standardizes how the frontend checklist is applied in `apps/web`.

## Page State Rule

- For async/data-driven pages, implement all four states: loading, error, empty, and success.
- For static pages without async fetch/mutation, model applicable states only.
- Success state can be inline (for example, `Alert`) or explicit post-action feedback (for example, toast).

## Required Responsive Audit Targets

- Validate layouts at: `375px`, `768px`, `1024px`, `1440px`.
- Keep automated no-overflow coverage in Playwright.

## Accessibility Checks

- Keep semantic HTML, focus-visible states, labels, and alt text as baseline requirements.
- Run contrast checks in E2E using axe (`color-contrast` rule) before merge.
