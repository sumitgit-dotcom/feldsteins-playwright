const { test, expect } = require('@playwright/test');

async function closeShippingPopupIfPresent(page) {
  const popup = page.getByRole('dialog', { name: 'FLYOUT Form' });
  const closeButton = popup.getByRole('button', { name: 'Close dialog' });
  await closeButton.waitFor({ state: 'visible', timeout: 3_000 }).catch(() => {});
  if (await closeButton.isVisible().catch(() => false)) {
    await closeButton.click({ force: true });
    await expect(popup).toBeHidden();
  }
}

test.describe('Homepage appointment banner', () => {
  test('opens the appointment form, submits dummy details, and shows confirmation', async ({ page }) => {
    test.setTimeout(90_000);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await closeShippingPopupIfPresent(page);

    const appointmentBannerLink = page.getByRole('link', {
      name: /request engagement ring appointment/i,
    }).first();
    await expect(appointmentBannerLink).toBeVisible();
    await Promise.all([
      page.waitForURL(/\/pages\/shopping-experiences\?type=Engagement/i, {
        waitUntil: 'commit',
        timeout: 30_000,
      }),
      appointmentBannerLink.click(),
    ]);

    const appointmentForm = page.locator('form.nf-form');
    await expect(appointmentForm).toBeVisible();

    await appointmentForm.getByLabel('Engagement Rings').check();
    await appointmentForm.getByPlaceholder('First Name').fill('Playwright');
    await appointmentForm.getByPlaceholder('Last Name').fill('Test');
    await appointmentForm
      .getByPlaceholder('If So, What Name(s) Would Your Account Be Under?')
      .fill('Playwright Test Account');
    await appointmentForm.locator('select').nth(0).selectOption({ label: 'Green Bay Store' });

    const dateField = appointmentForm.getByPlaceholder('Appointment Date');
    await dateField.click();
    const availableDate = page.locator('.pika-table td:not(.is-disabled):not(.is-empty) button').first();
    await expect(availableDate).toBeVisible();
    await availableDate.click();
    await expect(dateField).not.toHaveValue('');

    await appointmentForm.locator('select').nth(1).selectOption({ index: 1 });
    await appointmentForm.getByPlaceholder('Your phone').fill('5550100123');
    await appointmentForm.getByPlaceholder('Your email').fill('playwright.test@example.com');
    await appointmentForm
      .getByPlaceholder("Is There Anything You'd Like Us To Know To Prepare For Your Appointment?")
      .fill('Automated test submission using dummy details. No appointment is requested.');
    await appointmentForm.locator('select').nth(2).selectOption({ label: 'Google' });

    await appointmentForm.getByRole('button', { name: 'SUBMIT' }).click();
    await expect(appointmentForm.getByRole('alert')).toHaveText(
      /The form was submitted\. Thank you! We'll get back to you soon!/i,
      { timeout: 30_000 },
    );
  });
});
