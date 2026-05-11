import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1024, height: 768 },
  { name: 'desktop', width: 1440, height: 900 },
] as const;

for (const vp of viewports) {
  test.describe(`no horizontal overflow at ${vp.width}px`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test('home page', async ({ page }) => {
      await page.goto('/');
      const overflow = await page.evaluate(() => {
        const el = document.documentElement;
        return el.scrollWidth > el.clientWidth;
      });
      expect(overflow, 'document should not scroll horizontally').toBe(false);
    });

    test('hotels page', async ({ page }) => {
      await page.goto('/hotels');
      const overflow = await page.evaluate(() => {
        const el = document.documentElement;
        return el.scrollWidth > el.clientWidth;
      });
      expect(overflow, 'document should not scroll horizontally').toBe(false);
    });
  });
}
