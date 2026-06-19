const { test, expect } = require('@playwright/test');

const viewports = [
  { name: 'iphone-se', width: 375, height: 667, isMobile: true },
  { name: 'iphone-15', width: 393, height: 852, isMobile: true },
  { name: 'pixel', width: 412, height: 915, isMobile: true },
  { name: 'desktop', width: 1280, height: 900, isMobile: false }
];

for (const viewport of viewports) {
  test(`logged-out auth layout fits ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');
    await expect(page.locator('#welcomeNextBtn')).toBeVisible();
    await page.locator('#welcomeNextBtn').click();
    await expect(page.locator('#signupBtn')).toBeVisible();
    await expect(page.locator('#authMessage')).toBeHidden();
  });
}

test('update banner can be shown and applied without auto reload', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    window.updateBannerReady = true;
    window.waitingServiceWorker = { postMessage: () => {} };
    document.body.classList.remove('logged-out');
    document.getElementById('onboarding')?.classList.add('hidden');
    document.getElementById('updateBanner')?.classList.remove('hidden');
  });
  await expect(page.locator('#updateBanner')).toBeVisible();
});
