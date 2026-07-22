import { expect, test } from "@playwright/test";

const origin = "http://127.0.0.1:8000";

test.describe("homepage", () => {
  test("loads with correct document structure", async ({ page }) => {
    const consoleMessages = [];
    const failedRequests = [];
    const externalRequests = [];

    page.on("console", (message) => {
      if (message.type() === "error" || message.type() === "warning") {
        consoleMessages.push(message.text());
      }
    });
    page.on("requestfailed", (request) => {
      failedRequests.push(request.url());
    });
    page.on("request", (request) => {
      if (!request.url().startsWith(origin)) {
        externalRequests.push(request.url());
      }
    });

    const response = await page.goto("/");

    expect(response.status()).toBe(200);
    await expect(page).toHaveTitle(/\S/);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("html")).toHaveAttribute("lang", "sv");
    expect(consoleMessages).toEqual([]);
    expect(failedRequests).toEqual([]);
    expect(externalRequests).toEqual([]);
  });

  test("hero is visible immediately and keeps the locked structure", async ({
    page,
  }) => {
    await page.goto("/");

    const title = page.locator("#hero-title");

    await expect(title).toBeVisible();
    await expect(title.locator("span")).toHaveCount(2);
    await expect(title.locator("br")).toHaveCount(0);
    await expect(page.locator(".hero__lead")).toHaveClass(/pretty/);
    await expect(page.locator('.hero__action[href="/portfolj/"]')).toHaveText(
      "Utforska portföljen",
    );
    await expect(page.locator('.hero__action[href="/bolaget/"]')).toHaveText(
      "Om bolaget",
    );

    const opacity = await title.evaluate(
      (element) => getComputedStyle(element).opacity,
    );
    expect(opacity).toBe("1");
  });

  test("hero has no horizontal overflow at measured widths", async ({
    page,
  }) => {
    for (const width of [320, 360, 390, 430, 768]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");

      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      );

      expect(overflow, `horizontal overflow at ${width}px`).toBe(false);
    }
  });

  test("hero uses the approved four-line mobile and two-line desktop fall", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const mobileLines = await page
      .locator("#hero-title > span")
      .evaluateAll((spans) => {
        const countLines = (element) => {
          const range = document.createRange();
          range.selectNodeContents(element);
          return [...range.getClientRects()].filter(
            (rect) => rect.width > 0 && rect.height > 0,
          ).length;
        };

        return spans.reduce((total, span) => total + countLines(span), 0);
      });

    expect(mobileLines).toBe(4);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.reload();

    const desktopLines = await page
      .locator("#hero-title > span")
      .evaluateAll((spans) => {
        const countLines = (element) => {
          const range = document.createRange();
          range.selectNodeContents(element);
          return [...range.getClientRects()].filter(
            (rect) => rect.width > 0 && rect.height > 0,
          ).length;
        };

        return spans.reduce((total, span) => total + countLines(span), 0);
      });

    expect(desktopLines).toBe(2);
  });

  test("back and forward navigation works", async ({ page }) => {
    await page.goto("/");
    await page.goto("/index.html");
    await page.goBack();
    await expect(page.locator("h1")).toBeVisible();
    await page.goForward();
    await expect(page.locator("h1")).toBeVisible();
  });

  test("missing resources return 404", async ({ page }) => {
    const response = await page.goto("/finns-inte");
    expect(response.status()).toBe(404);
  });
});
