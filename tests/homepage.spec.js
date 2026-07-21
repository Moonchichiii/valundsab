import { expect, test } from "@playwright/test";

const origin = "http://127.0.0.1:8000";

test.describe("homepage baseline", () => {
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
    expect(await page.locator("h1").count()).toBe(1);
    expect(await page.locator("main").count()).toBe(1);
    await expect(page.locator("html")).toHaveAttribute("lang", "sv");
    expect(consoleMessages).toEqual([]);
    expect(failedRequests).toEqual([]);
    expect(externalRequests).toEqual([]);
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
