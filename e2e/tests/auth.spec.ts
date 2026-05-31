import { test, expect } from "@playwright/test";

function uniqueEmail() {
  return `test-${Date.now()}@example.com`;
}

test.describe("Authentication", () => {
  test("unauthenticated user is redirected to login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/login");
  });

  test("user can sign up and lands on the board", async ({ page }) => {
    await page.goto("/signup");
    await page.fill('[placeholder="Email address"]', uniqueEmail());
    await page.fill('[placeholder="Password"]', "testpass123");
    await page.click('button:has-text("Sign Up")');

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("button", { name: /new note/i })).toBeVisible();
  });

  test("user can log in with the demo account", async ({ page }) => {
    await page.goto("/login");
    await page.fill('[placeholder="Email address"]', "demo@notes.app");
    await page.fill('[placeholder="Password"]', "demo1234");
    await page.click('button:has-text("Log In")');

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("button", { name: /new note/i })).toBeVisible();
  });

  test("wrong credentials show an error and stay on login", async ({ page }) => {
    await page.goto("/login");
    await page.fill('[placeholder="Email address"]', "nobody@example.com");
    await page.fill('[placeholder="Password"]', "wrongpass");
    await page.click('button:has-text("Log In")');

    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
    await expect(page).toHaveURL("/login");
  });

  test("duplicate email on signup shows an error", async ({ page }) => {
    const email = uniqueEmail();

    // Register once
    await page.goto("/signup");
    await page.fill('[placeholder="Email address"]', email);
    await page.fill('[placeholder="Password"]', "testpass123");
    await page.click('button:has-text("Sign Up")');
    await expect(page).toHaveURL("/");

    // Log out and try to register again with the same email
    await page.click('button[aria-label="Open user menu"]');
    await page.click('button:has-text("Log out")');
    await page.goto("/signup");
    await page.fill('[placeholder="Email address"]', email);
    await page.fill('[placeholder="Password"]', "testpass123");
    await page.click('button:has-text("Sign Up")');

    await expect(page.getByText(/already exists/i)).toBeVisible();
  });

  test("logged-in user visiting /login is redirected to board", async ({ page }) => {
    await page.goto("/signup");
    await page.fill('[placeholder="Email address"]', uniqueEmail());
    await page.fill('[placeholder="Password"]', "testpass123");
    await page.click('button:has-text("Sign Up")');
    await expect(page).toHaveURL("/");

    await page.goto("/login");
    await expect(page).toHaveURL("/");
  });

  test("log out redirects to login and back button does not return to board", async ({ page }) => {
    await page.goto("/login");
    await page.fill('[placeholder="Email address"]', "demo@notes.app");
    await page.fill('[placeholder="Password"]', "demo1234");
    await page.click('button:has-text("Log In")');
    await expect(page).toHaveURL("/");

    await page.click('button[aria-label="Open user menu"]');
    await page.click('button:has-text("Log out")');
    await expect(page).toHaveURL("/login");

    await page.goBack();
    await expect(page).toHaveURL("/login");
  });
});
