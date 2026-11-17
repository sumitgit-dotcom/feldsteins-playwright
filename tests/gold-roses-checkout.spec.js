const { test, expect } = require('@playwright/test');

async function closeShippingPopupIfPresent(page) {
  const shippingPopup = page.getByRole('dialog', { name: 'FLYOUT Form' });
  const closeButton = shippingPopup.getByRole('button', { name: 'Close dialog' });
  await closeButton.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
  if (await closeButton.isVisible()) {
    await closeButton.click({ force: true });
    await expect(shippingPopup).toBeHidden();
  }
}

test.describe('Gold Roses checkout flow', () => {
  test('filters by Alibaba, opens the first product, and proceeds to checkout', async ({ page, browserName }) => {
    test.setTimeout(180_000);
    if (browserName === 'webkit') {
      await page.setViewportSize({ width: 390, height: 844 });
    }
    await page.goto('/', { waitUntil: 'commit' });
    await closeShippingPopupIfPresent(page);

    const goldRosesLink = page.getByRole('link', { name: /Gold Roses/i }).first();
    if (browserName === 'webkit') {
      await page.locator('a.icon-nav:visible').first().click({ timeout: 10_000 }).catch(() => {});
    }
    await closeShippingPopupIfPresent(page);
    await goldRosesLink.click({ timeout: 10_000, noWaitAfter: true }).catch(() => {});
    await page.waitForURL(/\/collections\/gold-roses/, { waitUntil: 'commit', timeout: 10_000 }).catch(() => {});
    if (!/\/collections\/gold-roses/.test(page.url())) {
      await page.goto('/collections/gold-roses', { waitUntil: 'commit' });
    }
    if (browserName === 'webkit') {
      await page.setViewportSize({ width: 1280, height: 850 });
    }
    await closeShippingPopupIfPresent(page);

    await closeShippingPopupIfPresent(page);
    await page.locator('.sidebar-label:visible').click();
    await closeShippingPopupIfPresent(page);

    const alibabaCheckbox = page.locator('#Filter-Designers-1');
    const alibabaLabel = page.locator('label[for="Filter-Designers-1"]');
    if (!(await alibabaLabel.isVisible())) {
      await page.locator('.sidebar-filter h3.sidebar-title').filter({ hasText: /^Designers$/ }).click();
    }
    await expect(alibabaLabel).toBeVisible();
    await closeShippingPopupIfPresent(page);
    await alibabaLabel.click();
    await expect(alibabaCheckbox).toBeChecked();

    await page.locator('.sidebar-filter .close-sidebar.close').click();

    const firstProduct = page.locator('a.product-title:visible').first();
    await expect(firstProduct).toBeVisible();
    const productName = (await firstProduct.innerText()).trim();
    await Promise.all([
      page.waitForURL(/\/products\//, { waitUntil: 'commit' }),
      firstProduct.click(),
    ]);
    await expect(page.locator('h1.product-title')).toHaveText(productName, { timeout: 30_000 });

    await page.locator('#product-add-to-cart').click();

    const proceedToCheckout = page.getByText(/proceed to checkout/i);
    await expect(proceedToCheckout).toBeVisible({ timeout: 15_000 });
    await proceedToCheckout.click();
    await expect(page).toHaveURL(/\/checkouts?\//);
  });
});
