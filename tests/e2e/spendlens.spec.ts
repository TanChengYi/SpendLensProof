import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('traces an anomaly back to its raw statement row', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Your July money brief.' })).toBeVisible()
  await page.getByRole('button', { name: 'Review Fresh Mart spike' }).click()

  await expect(page.getByRole('heading', { name: 'Transactions' })).toBeVisible()
  await expect(page.getByText('FRESH MART #4482')).toBeVisible()
  await expect(page.getByText('1 transaction linked to the selected finding.')).toBeVisible()
})

test('blocks an ambiguous CSV until the date convention is explicit', async ({ page }) => {
  await page.getByRole('button', { name: 'Import statement' }).click()
  await page.getByLabel('Choose CSV statement').setInputFiles({
    name: 'september.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('Date,Description,Amount\n03/04/2026,BOOK SHOP,-45.00'),
  })

  await expect(page.getByRole('heading', { name: 'Resolve before commit' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Commit import' })).toBeDisabled()

  await page.getByLabel('Date format').selectOption('mdy')
  await expect(page.getByRole('button', { name: 'Commit import' })).toBeEnabled()
})
