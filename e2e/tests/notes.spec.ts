import { test, expect, type Page, type Browser } from "@playwright/test";

function uniqueEmail() {
  return `test-${Date.now()}-${Math.floor(Math.random() * 9999)}@example.com`;
}

async function signUpAndLand(page: Page): Promise<void> {
  await page.goto("/signup");
  await page.fill('[placeholder="Email address"]', uniqueEmail());
  await page.fill('[placeholder="Password"]', "testpass123");
  await page.click('button:has-text("Sign Up")');
  await expect(page).toHaveURL("/");
}

/**
 * Create a note and wait for it to be saved before closing.
 *
 * Clicking Close while the title field has focus fires both a blur (which
 * triggers autosave) and the close handler (which also calls persist) before
 * either save resolves — resulting in two duplicate notes. Moving focus to
 * the content field first lets the blur-triggered save complete, so Close
 * only issues an update, not a second create.
 */
async function createNote(page: Page, title: string): Promise<void> {
  await page.click('button:has-text("New Note")');
  await page.fill('[aria-label="Note title"]', title);
  await page.locator('[aria-label="Note content"]').click(); // blur title → persist fires
  await expect(page.locator("text=Last Edited")).toBeVisible(); // save confirmed
  await page.click('[aria-label="Close"]');
  await expect(page.getByText(title)).toBeVisible();
}

test.describe("Notes CRUD", () => {
  test("user starts with an empty board", async ({ page }) => {
    await signUpAndLand(page);
    await expect(page.getByText(/no notes yet/i)).toBeVisible();
  });

  test("user can create a note and it appears on the board", async ({ page }) => {
    await signUpAndLand(page);
    await createNote(page, "My first note");
  });

  test("user can edit an existing note", async ({ page }) => {
    await signUpAndLand(page);
    await createNote(page, "Original title");

    await page.click("text=Original title");
    await page.click('button:has-text("Edit")');
    await page.fill('[aria-label="Note title"]', "Updated title");
    await page.locator('[aria-label="Note content"]').click();
    await expect(page.locator("text=Last Edited")).toBeVisible();
    await page.click('[aria-label="Close"]');

    await expect(page.getByText("Updated title")).toBeVisible();
    await expect(page.getByText("Original title")).toHaveCount(0);
  });

  test("user can delete a note", async ({ page }) => {
    await signUpAndLand(page);
    await createNote(page, "Delete me");

    await page.click("text=Delete me");
    await page.click('[aria-label="Delete note"]');

    await expect(page.getByText("Delete me")).toHaveCount(0);
  });

  test("notes from one user are not visible to another", async ({ browser }: { browser: Browser }) => {
    const ctx1 = await browser.newContext();
    const page1 = await ctx1.newPage();
    await signUpAndLand(page1);
    await createNote(page1, "User 1 private note");
    await ctx1.close();

    const ctx2 = await browser.newContext();
    const page2 = await ctx2.newPage();
    await signUpAndLand(page2);
    await expect(page2.getByText("User 1 private note")).toHaveCount(0);
    await expect(page2.getByText(/no notes yet/i)).toBeVisible();
    await ctx2.close();
  });
});
