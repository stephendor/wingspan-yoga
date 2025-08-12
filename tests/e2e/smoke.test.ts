import { expect, test } from '@playwright/test';

// Basic smoke test to verify the site loads
test('home page loads and has expected content', async ({ page }) => {
  // Navigate to the home page
  await page.goto('/');
  
  // Verify page title
  await expect(page).toHaveTitle(/Wingspan Yoga/);
  
  // Verify navigation exists
  await expect(page.locator('nav')).toBeVisible();
  
  // Verify some expected content on the home page
  await expect(page.getByRole('heading', { name: /Wingspan Yoga/i, level: 1 })).toBeVisible();
});

// Test E2E authentication bypass
test('can bypass authentication for testing', async ({ page }) => {
  // Go to the E2E test page
  await page.goto('/e2e-test');
  
  // Enter the test key
  await page.getByLabel('Test Key').fill('wingspan-yoga-e2e-test-key');
  
  // Submit the form
  await page.getByRole('button', { name: 'Authenticate for Testing' }).click();
  
  // Wait for redirect to homepage after successful authentication
  await page.waitForURL('/', { timeout: 10000 });
  
  // Verify we're now logged in (user menu should be visible)
  await expect(page.getByText('E2E Test User')).toBeVisible();
});

// Test authenticated page access after bypass
test('can access protected content after auth bypass', async ({ page }) => {
  // First authenticate with the bypass
  await page.goto('/e2e-test');
  await page.getByLabel('Test Key').fill('wingspan-yoga-e2e-test-key');
  await page.getByRole('button', { name: 'Authenticate for Testing' }).click();
  await page.waitForURL('/', { timeout: 10000 });
  
  // Now navigate to a protected page (like videos)
  await page.goto('/videos');
  
  // Verify we can see the videos page and not a login redirect
  // This assumes the videos page has some kind of heading or content to verify
  await expect(page.getByRole('heading', { name: /videos/i, level: 1 })).toBeVisible();
});
