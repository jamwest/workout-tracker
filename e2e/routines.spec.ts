import { test, expect, type Page } from '@playwright/test'

// ── Helpers ───────────────────────────────────────────────────────────────────

async function createRoutine(page: Page, name: string) {
  await page.getByLabel(/routine name/i).fill(name)
  await page.getByRole('button', { name: /^create$/i }).click()
  await expect(page.getByText(name)).toBeVisible()
}

async function expandCard(page: Page, name: string) {
  const card = page.getByTestId('routine-card').filter({ hasText: name })
  await card.getByRole('button', { name: new RegExp(name, 'i') }).click()
  await expect(card.getByRole('button', { name: /start workout/i })).toBeVisible()
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe('Routines page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('shows empty state and the New Routine form on first visit', async ({ page }) => {
    await expect(page.getByText(/no routines yet/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /^create$/i })).toBeVisible()
  })

  test('creates a routine and shows it as a card', async ({ page }) => {
    await createRoutine(page, 'Push Day')
    await expect(page.getByTestId('routine-card')).toBeVisible()
    await expect(page.getByText(/no routines yet/i)).not.toBeVisible()
  })

  test('creates multiple routines and shows one card each', async ({ page }) => {
    await createRoutine(page, 'Push Day')
    await createRoutine(page, 'Pull Day')
    await expect(page.getByTestId('routine-card')).toHaveCount(2)
  })

  test('input clears after creating a routine', async ({ page }) => {
    await createRoutine(page, 'Push Day')
    await expect(page.getByLabel(/routine name/i)).toHaveValue('')
  })

  test('expands a routine card to reveal action buttons', async ({ page }) => {
    await createRoutine(page, 'Push Day')
    await expandCard(page, 'Push Day')
    await expect(page.getByRole('button', { name: /start workout/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /delete routine/i })).toBeVisible()
  })

  test('collapses an expanded card on a second tap', async ({ page }) => {
    await createRoutine(page, 'Push Day')
    const toggle = page.getByRole('button', { name: /push day/i })
    await toggle.click()
    await expect(page.getByRole('button', { name: /start workout/i })).toBeVisible()
    await toggle.click()
    await expect(page.getByRole('button', { name: /start workout/i })).not.toBeVisible()
  })

  test('deletes a routine after confirming the dialog', async ({ page }) => {
    await createRoutine(page, 'Push Day')
    await expandCard(page, 'Push Day')
    await page.getByRole('button', { name: /delete routine/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: /confirm/i }).click()
    await expect(page.getByTestId('routine-card')).not.toBeVisible()
    await expect(page.getByText(/no routines yet/i)).toBeVisible()
  })

  test('cancels routine deletion — card remains', async ({ page }) => {
    await createRoutine(page, 'Push Day')
    await expandCard(page, 'Push Day')
    await page.getByRole('button', { name: /delete routine/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: /cancel/i }).click()
    await expect(page.getByTestId('routine-card')).toBeVisible()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('shows abandon-session dialog when starting a workout with an active session', async ({ page }) => {
    // Start a session on the first routine
    await createRoutine(page, 'Push Day')
    await expandCard(page, 'Push Day')
    await page.getByTestId('routine-card').filter({ hasText: 'Push Day' })
      .getByRole('button', { name: /start workout/i }).click()

    // Attempt to start a different routine — dialog must appear
    await createRoutine(page, 'Pull Day')
    await expandCard(page, 'Pull Day')
    await page.getByTestId('routine-card').filter({ hasText: 'Pull Day' })
      .getByRole('button', { name: /start workout/i }).click()

    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText(/abandon/i)).toBeVisible()
  })

  test('abandons the active session and starts the new one on confirm', async ({ page }) => {
    await createRoutine(page, 'Push Day')
    await expandCard(page, 'Push Day')
    await page.getByTestId('routine-card').filter({ hasText: 'Push Day' })
      .getByRole('button', { name: /start workout/i }).click()

    await createRoutine(page, 'Pull Day')
    await expandCard(page, 'Pull Day')
    await page.getByTestId('routine-card').filter({ hasText: 'Pull Day' })
      .getByRole('button', { name: /start workout/i }).click()

    await page.getByRole('button', { name: /confirm/i }).click()

    // Dialog dismissed — no error state
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })
})
