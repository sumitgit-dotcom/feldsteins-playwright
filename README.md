# Feldsteins Playwright project

JavaScript end-to-end smoke checks for the Feldsteins Jewelers storefront.

## Setup

```bash
npm install
npx playwright install chromium
```

## Run

```bash
npm test
```

Useful variants:

```bash
npm run test:headed
npm run test:ui
npm run report
```

The default target is `https://feldsteins.com`. To point the checks at another environment, set `BASE_URL` before running Playwright:

```powershell
$env:BASE_URL = 'https://staging.example.com'
npm test
```

The first suite checks the homepage title and shopping categories, featured product and designer sections, and the cookie acceptance interaction.
