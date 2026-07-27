import { expect, test } from "@playwright/test";

const FIXTURE = {
  optionalPurposes: [
    {
      id: "test-analys",
      label: "Testanalys",
      description: "Fixture-ändamål som endast existerar i test.",
    },
  ],
};

async function activateRequiredMode(page) {
  await page.addInitScript((config) => {
    window.__valundsConsentConfig = config;
  }, FIXTURE);
  await page.goto("/");
  await page.addStyleTag({ url: "/assets/css/consent-banner.css" });
  await page.addScriptTag({
    url: "/assets/js/consent-choices.js",
    type: "module",
  });
  await page.waitForSelector("[data-consent-required]", { state: "attached" });
}

test.describe("necessary-only (produktionsläge)", () => {
  test("ingen banner, inga valknappar och ingen lagring skapas", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator(".consent-banner")).toBeHidden();
    await expect(page.locator('[data-consent-action="accept"]')).toBeHidden();
    await expect(page.locator('[data-consent-action="reject"]')).toBeHidden();
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(200);
    const storage = await page.evaluate(() => ({
      cookies: document.cookie,
      local: localStorage.length,
      session: sessionStorage.length,
    }));
    expect(storage.cookies).toBe("");
    expect(storage.local).toBe(0);
    expect(storage.session).toBe(0);
  });

  test("launchern finns nere till vänster och öppnar panelen", async ({
    page,
  }) => {
    await page.goto("/");
    const launcher = page.locator(".cookie-launcher");
    await expect(launcher).toBeVisible();
    const box = await launcher.boundingBox();
    const viewport = page.viewportSize();
    expect(box.x).toBeLessThan(viewport.width / 2);
    expect(box.height).toBeGreaterThanOrEqual(44);
    await launcher.click();
    await expect(page.locator(".consent-settings")).toBeVisible();
    await expect(page.locator("#cookie-settings-title")).toHaveText(
      "Om kakor på Valunds",
    );
    await page.keyboard.press("Escape");
    await expect(page.locator(".consent-settings")).toBeHidden();
  });

  test("scroll ned kollapsar launchern, scroll upp expanderar", async ({
    page,
  }) => {
    await page.goto("/");
    const launcher = page.locator(".cookie-launcher");
    await page.mouse.wheel(0, 700);
    await expect(page.locator("[data-consent][data-collapsed]")).toHaveCount(1);
    await expect
      .poll(async () => Math.round((await launcher.boundingBox()).width))
      .toBe(68);
    await expect
      .poll(async () => Math.round((await launcher.boundingBox()).height))
      .toBe(68);
    await page.evaluate(() => window.scrollTo(0, 300));
    await expect(page.locator("[data-consent][data-collapsed]")).toHaveCount(0);
  });

  test("juridiska sidor finns och footern länkar till dem", async ({
    page,
  }) => {
    for (const route of ["/kakor/", "/integritet/"]) {
      const response = await page.goto(route);
      expect(response.status()).toBe(200);
      await expect(page.locator("h1")).toBeVisible();
    }
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("link", { name: "Kakor" })).toBeVisible();
    await expect(
      footer.getByRole("link", { name: "Integritet" }),
    ).toBeVisible();
  });

  test("ingen horisontell overflow och fri mobilnavigation", async ({
    browser,
  }) => {
    for (const width of [320, 360, 390, 768, 1440]) {
      const page = await browser.newPage({
        viewport: { width, height: 820 },
      });
      await page.goto("http://127.0.0.1:8000/");
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow, `${width}px overflow`).toBe(0);
      if (width < 704) {
        const launcher = await page.locator(".cookie-launcher").boundingBox();
        const navigation = await page.locator(".site-navigation").boundingBox();
        expect(
          launcher.y + launcher.height,
          `${width}px nav-clearance`,
        ).toBeLessThanOrEqual(navigation.y);
      }
      await page.close();
    }
  });
});

test.describe("consent-required (fixture)", () => {
  test("bannern visas, ligger kvar efter scroll och scroll ändrar inget", async ({
    page,
  }) => {
    await activateRequiredMode(page);
    const banner = page.locator(".consent-banner");
    await expect(banner).toBeVisible();
    await expect(page.locator(".cookie-launcher")).toBeHidden();
    await page.mouse.wheel(0, 1600);
    await page.waitForTimeout(250);
    await expect(banner).toBeVisible();
    const state = await page.evaluate(() =>
      localStorage.getItem("valunds-consent"),
    );
    expect(state).toBeNull();
  });

  test("scroll före val förkollapsar aldrig launchern", async ({ page }) => {
    await activateRequiredMode(page);
    await page.mouse.wheel(0, 1600);
    await page.waitForTimeout(250);
    await expect(page.locator("[data-consent][data-collapsed]")).toHaveCount(0);
    await page.locator('[data-consent-action="accept"]').click();
    const launcher = page.locator(".cookie-launcher");
    await expect(launcher).toBeVisible();
    await expect
      .poll(async () => Math.round((await launcher.boundingBox()).width))
      .toBeGreaterThan(150);
    await page.mouse.wheel(0, 200);
    await expect(page.locator("[data-consent][data-collapsed]")).toHaveCount(1);
  });

  test("acceptera och avvisa har likvärdig visuell vikt", async ({ page }) => {
    await activateRequiredMode(page);
    const styles = await page.evaluate(() => {
      const pick = (selector) => {
        const s = getComputedStyle(document.querySelector(selector));
        return [s.fontSize, s.fontWeight, s.backgroundColor, s.height];
      };
      return {
        accept: pick('[data-consent-action="accept"]'),
        reject: pick('[data-consent-action="reject"]'),
      };
    });
    expect(styles.accept).toEqual(styles.reject);
  });

  test("accept sparar versionerad state som överlever reload och kör hooken", async ({
    page,
  }) => {
    await activateRequiredMode(page);
    await page.evaluate(() => {
      window.__hookRan = false;
      window.valundsConsent.onAllow("test-analys", () => {
        window.__hookRan = true;
      });
    });
    await page.locator('[data-consent-action="accept"]').click();
    await expect(page.locator(".consent-banner")).toBeHidden();
    await expect(page.locator(".cookie-launcher")).toBeVisible();
    expect(await page.evaluate(() => window.__hookRan)).toBe(true);
    const record = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("valunds-consent")),
    );
    expect(record.v).toBe(1);
    expect(record.choice).toBe("accepted");
    await activateRequiredMode(page);
    await expect(page.locator(".consent-banner")).toBeHidden();
  });

  test("reject blockerar hooken och withdrawal återställer pending", async ({
    page,
  }) => {
    await activateRequiredMode(page);
    await page.evaluate(() => {
      window.__hookRan = false;
      window.valundsConsent.onAllow("test-analys", () => {
        window.__hookRan = true;
      });
    });
    await page.locator('[data-consent-action="reject"]').click();
    expect(await page.evaluate(() => window.__hookRan)).toBe(false);
    expect(
      await page.evaluate(() => window.valundsConsent.isAllowed("test-analys")),
    ).toBe(false);
    await page.locator(".cookie-launcher").click();
    await page.locator('[data-consent-action="withdraw"]').click();
    await expect(page.locator(".consent-banner")).toBeVisible();
    expect(
      await page.evaluate(() => localStorage.getItem("valunds-consent")),
    ).toBeNull();
  });

  test("malformed state behandlas som pending", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("valunds-consent", "{trasig json");
    });
    await activateRequiredMode(page);
    await expect(page.locator(".consent-banner")).toBeVisible();
    expect(
      await page.evaluate(() => localStorage.getItem("valunds-consent")),
    ).toBeNull();
  });

  test("anpassat val genomdrivs via spara", async ({ page }) => {
    await activateRequiredMode(page);
    await page
      .locator(".consent-banner button", { hasText: "Anpassa" })
      .click();
    await page.locator('[data-purpose="test-analys"]').check({ force: true });
    await page.locator('[data-consent-action="save"]').click();
    const record = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("valunds-consent")),
    );
    expect(record.choice).toBe("custom");
    expect(record.p["test-analys"]).toBe(true);
  });
});

test.describe("popover-fallback", () => {
  test("utan popover-stöd exponeras panelen aldrig som sidinnehåll", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      delete HTMLElement.prototype.showPopover;
      delete HTMLElement.prototype.hidePopover;
      delete HTMLElement.prototype.togglePopover;
    });
    await page.goto("/");
    await expect(page.locator(".consent-settings")).toBeHidden();
    await page.locator(".cookie-launcher").click();
    await expect(page.locator(".consent-settings")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator(".consent-settings")).toBeHidden();
    await expect(page.locator(".cookie-launcher")).toBeFocused();
  });
});
