const { test, expect } = require('@playwright/test');

test.describe('Feldsteins storefront homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'commit' });
  });

  test('opens the homepage and shows the store title', async ({ page }) => {
    await expect(page).toHaveTitle(/Feldsteins|Engagement Rings|Fine Jewelry/i);
  });

  test('shows featured products and designer collections', async ({ page }) => {
    await expect(page.getByText('Popular Products', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Engagement Ring.*Center Diamond Not Included/i }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /Engagement collections/i })).toBeVisible();

    for (const designer of ['gabriel', 'levian', 'Verragio']) {
      await expect(page.getByRole('heading', { name: new RegExp(designer, 'i') })).toBeVisible();
    }
  });

  test('allows the cookie notice to be accepted when it is shown', async ({ page }) => {
    const acceptCookies = page.getByRole('link', { name: /accept/i });
    if (await acceptCookies.isVisible().catch(() => false)) {
      await acceptCookies.click();
      await expect(page.getByText(/allow all cookies/i)).toBeHidden();
    }
  });
});
