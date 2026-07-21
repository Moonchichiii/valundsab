import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("accessibility baseline", () => {
  test("document identity", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/\S/);
    await expect(page.locator("html")).toHaveAttribute("lang", "sv");
  });

  test("no axe violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
