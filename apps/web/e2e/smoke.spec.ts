import { test, expect } from '@playwright/test';

test('home page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
});

test('hotels page loads or shows error when API down', async ({ page }) => {
  await page.goto('/hotels');
  const hotelsHeading = page.getByRole('heading', { name: 'Hotels' });
  const errorBanner = page.getByRole('alert');
  await expect(hotelsHeading.or(errorBanner)).toBeVisible({ timeout: 15000 });
});
