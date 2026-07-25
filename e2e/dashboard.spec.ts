import { expect, test } from "@playwright/test";

test("renders the desktop QA dashboard", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Desktop-only check");

  await page.goto("/");

  await expect(page.getByRole("heading", { name: "QA Case Study Lab" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "E-commerce Checkout" })).toBeVisible();
  await expect(page.getByText("Checkout journey map")).toBeVisible();
  await expect(page.getByText("Release quality signals")).toBeVisible();
  await expect(page.getByText("NO-GO")).toBeVisible();
  await expect(page.getByRole("heading", { name: "BUG-016" })).toBeVisible();
});

test("filters cases and creates a focused run", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Desktop-only check");

  await page.goto("/");

  await page.getByPlaceholder("Search cases, bugs, notes...").fill("PayPal");
  const testTable = page.getByRole("table");

  await expect(testTable.getByText("Place order with PayPal")).toBeVisible();
  await expect(testTable.getByText("Declined card shows error message")).toBeHidden();

  await page.getByRole("button", { name: "Run Tests" }).click();
  await expect(page.getByText("Run #29")).toBeVisible();
  await expect(
    page.getByText("Focused run created from 1 visible test cases."),
  ).toBeVisible();
});

test("selects linked defects and exports a markdown report", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Desktop-only check");

  await page.goto("/");

  await page.getByText("Expiration date in the past").click();
  await expect(page.getByRole("heading", { name: "BUG-017" })).toBeVisible();
  await expect(page.getByText("Linked to TC-038: Payment")).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Report" }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe("qa-case-study-report.md");
  await expect(page.getByText("Report preview")).toBeVisible();
  await expect(page.getByText("Not Run: 3")).toBeVisible();
});

test("mobile viewport does not create page-level horizontal overflow", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chrome", "Mobile-only check");

  await page.goto("/");

  const metrics = await page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    viewportWidth: window.innerWidth,
  }));

  expect(metrics.bodyScrollWidth).toBe(metrics.viewportWidth);
});
