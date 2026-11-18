const { test, expect } = require('@playwright/test');

test.describe('Watch search and BENCHMARK filter', () => {
  test('counts watch results, filters BENCHMARK, and opens its highest-priced watch', async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const searchField = page.locator('input[type="search"][aria-label="Search Site"]:visible').first();
    await expect(searchField).toBeVisible();
    await searchField.fill('watches');
    await page.locator('form[role="search"]:visible button').first().click();
    await page.waitForURL(/\/search\?/, { waitUntil: 'commit', timeout: 30_000 });

    const productCards = page.locator('.inner.product-item:visible');
    await expect(productCards.first()).toBeVisible();

    // Record the total shown by the search page, as well as how many cards it rendered.
    const searchSummary = await page.locator('body').innerText();
    const totalMatch = searchSummary.match(/(\d+)\s+Results Found For\s+"Watches"/i);
    const visibleWatchCount = await productCards.count();
    expect(visibleWatchCount).toBeGreaterThan(0);
    expect(totalMatch, 'The search page should show the total number of watch results').not.toBeNull();
    const totalWatchCount = Number(totalMatch[1]);
    console.log(`Watch search results: ${totalWatchCount} total; ${visibleWatchCount} product cards rendered.`);

    const benchmarkCheckbox = page.locator('#Filter-Designers-1');
    const benchmarkLabel = page.locator('label[for="Filter-Designers-1"]');
    await expect(benchmarkLabel).toBeVisible();
    await benchmarkLabel.click();
    await expect(benchmarkCheckbox).toBeChecked();
    const filterNavigated = await page.waitForURL(/filter\.p\.vendor/i, {
      waitUntil: 'commit',
      timeout: 5_000,
    }).then(() => true).catch(() => false);
    if (!filterNavigated) {
      await benchmarkCheckbox.evaluate((checkbox) => checkbox.form?.requestSubmit());
    }
    await expect(page).toHaveURL(/filter\.p\.vendor/i);

    // Shopify can update the filter URL before refreshing the product grid in WebKit.
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(benchmarkCheckbox).toBeChecked();

    await expect(productCards.first()).toBeVisible();
    const benchmarkProducts = await page.locator('.inner.product-item:visible').evaluateAll((cards) => cards.map((card) => {
      const title = card.querySelector('a.product-title');
      const priceText = card.querySelector('.price-box')?.innerText || card.innerText;
      const priceMatch = priceText.match(/\$\s*([\d,]+(?:\.\d{2})?)/);
      return {
        name: title?.innerText.trim(),
        href: title?.getAttribute('href'),
        price: priceMatch ? Number(priceMatch[1].replaceAll(',', '')) : NaN,
      };
    }).filter((product) => product.name && product.href && Number.isFinite(product.price)));

    expect(benchmarkProducts.length, 'BENCHMARK results should include products with readable prices').toBeGreaterThan(0);
    const highestPricedProduct = benchmarkProducts.reduce((highest, product) => (
      product.price > highest.price ? product : highest
    ));
    console.log(`Highest-priced BENCHMARK watch: ${highestPricedProduct.name} ($${highestPricedProduct.price.toFixed(2)}).`);

    const highestProductLink = page.locator(`a.product-title[href="${highestPricedProduct.href}"]:visible`);
    await expect(highestProductLink).toBeVisible();
    await Promise.all([
      page.waitForURL(/\/products\//, { waitUntil: 'commit', timeout: 30_000 }),
      highestProductLink.click(),
    ]);
    await expect(page.locator('h1.product-title')).toHaveText(highestPricedProduct.name);
  });
});
