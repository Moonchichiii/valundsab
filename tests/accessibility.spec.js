import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/portfolj/",
  "/bolaget/",
  "/engineering/",
  "/kontakt/",
  "/kakor/",
  "/integritet/",
];

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

  test("no axe violations on legal routes", async ({ page }) => {
    for (const route of ["/kakor/", "/integritet/"]) {
      await page.goto(route);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations, route).toEqual([]);
    }
  });

  test("no axe violations with the settings panel open", async ({ page }) => {
    await page.goto("/");
    await page.locator(".cookie-launcher").click();
    await expect(page.locator(".consent-settings")).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("no axe violations with the consent banner shown", async ({ page }) => {
    await page.addInitScript(() => {
      window.__valundsConsentConfig = {
        optionalPurposes: [
          {
            id: "test-analys",
            label: "Testanalys",
            description: "Fixture-ändamål som endast existerar i test.",
          },
        ],
      };
    });
    await page.goto("/");
    await page.addStyleTag({ url: "/assets/css/consent-banner.css" });
    await page.addScriptTag({
      url: "/assets/js/consent-choices.js",
      type: "module",
    });
    await page.waitForSelector("[data-consent-required]", {
      state: "attached",
    });
    await expect(page.locator(".consent-banner")).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("every skip link targets an existing element", async ({ page }) => {
    for (const route of routes) {
      await page.goto(route);
      const links = page.locator(".skip-link");
      const count = await links.count();
      expect(count, route).toBeGreaterThan(0);
      for (let index = 0; index < count; index += 1) {
        const href = await links.nth(index).getAttribute("href");
        expect(href, route).toMatch(/^#.+/);
        await expect(page.locator(href), `${route} → ${href}`).toHaveCount(1);
      }
    }
  });
});
