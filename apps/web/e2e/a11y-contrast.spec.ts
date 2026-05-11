import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = [
  '/',
  '/hotels',
  '/login',
  '/register',
  '/book',
  '/forgot-password',
  '/reset-password?token=aaaaaaaaaaaaaaaaaaaaaaaaaa',
] as const;

for (const route of routes) {
  test(`color contrast has no serious issues on ${route}`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    const colorContrastViolations = results.violations.filter(
      (violation) => violation.id === 'color-contrast'
    );
    expect(colorContrastViolations, `Contrast issues found on ${route}`).toEqual([]);
  });
}
