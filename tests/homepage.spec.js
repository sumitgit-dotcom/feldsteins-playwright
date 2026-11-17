const { test, expect } = require('@playwright/test');

test.describe('Feldsteins storefront homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'commit' });
  });

  test('opens the homepage and shows the store title', async ({ page }) => {
    await expect(page).toHaveTitle(/Feldsteins|Engagement Rings|Fine Jewelry/i);
  });

  test('allows the cookie notice to be accepted when it is shown', async ({ page }) => {
    const acceptCookies = page.getByRole('link', { name: /accept/i });
    if (await acceptCookies.isVisible().catch(() => false)) {
      await acceptCookies.click();
      await expect(page.getByText(/allow all cookies/i)).toBeHidden();
    }
  });
});
