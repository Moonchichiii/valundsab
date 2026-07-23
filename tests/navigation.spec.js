import { expect, test } from "@playwright/test";

const routes = ["/", "/portfolj/", "/bolaget/", "/engineering/", "/kontakt/"];

const compactWidths = [320, 360, 390, 430];

test.describe("site navigation", () => {
  for (const route of routes) {
    test(`${route} exposes one working primary navigation`, async ({
      page,
    }) => {
      await page.goto(route);

      await expect(page.locator("nav")).toHaveCount(1);
      await expect(page.locator(".site-navigation__list > li")).toHaveCount(4);

      const destinations = await page
        .locator(".site-navigation a")
        .evaluateAll((links) => links.map((link) => link.getAttribute("href")));

      expect(destinations).toEqual([
        "/portfolj/",
        "/bolaget/",
        "/engineering/",
        "/kontakt/",
      ]);
    });
  }

  test("compact navigation fits every measured width", async ({ page }) => {
    for (const width of compactWidths) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/");
      await page.evaluate(() => document.fonts.ready);

      const layout = await page.evaluate(() => {
        const navigation = document.querySelector(".site-navigation");
        const list = document.querySelector(".site-navigation__list");
        const links = [...document.querySelectorAll(".site-navigation a")];
        const navigationRect = navigation.getBoundingClientRect();
        const linkRects = links.map((link) => link.getBoundingClientRect());
        const portfolioRect = document
          .querySelector(".hero__portfolio")
          .getBoundingClientRect();

        return {
          navigationPosition: getComputedStyle(navigation).position,
          listStyle: getComputedStyle(list).listStyleType,
          documentOverflow:
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth,
          navigationBottom: Math.round(
            window.innerHeight - navigationRect.bottom,
          ),
          portfolioBottom: portfolioRect.bottom,
          navigationTop: navigationRect.top,
          links: links.map((link, index) => ({
            left: linkRects[index].left,
            right: linkRects[index].right,
            width: linkRects[index].width,
            height: linkRects[index].height,
            clientWidth: link.clientWidth,
            scrollWidth: link.scrollWidth,
          })),
        };
      });

      expect(layout.navigationPosition, `${width}px position`).toBe("fixed");
      expect(layout.listStyle, `${width}px list style`).toBe("none");
      expect(layout.documentOverflow, `${width}px document overflow`).toBe(
        false,
      );
      expect(layout.navigationBottom, `${width}px bottom position`).toBe(0);
      expect(layout.portfolioBottom, `${width}px hero clearance`).toBeLessThan(
        layout.navigationTop,
      );

      for (const link of layout.links) {
        expect(link.width, `${width}px target width`).toBeGreaterThanOrEqual(
          44,
        );
        expect(link.height, `${width}px target height`).toBeGreaterThanOrEqual(
          44,
        );
        expect(link.left, `${width}px left boundary`).toBeGreaterThanOrEqual(0);
        expect(link.right, `${width}px right boundary`).toBeLessThanOrEqual(
          width,
        );
        expect(link.scrollWidth, `${width}px label width`).toBeLessThanOrEqual(
          link.clientWidth,
        );
      }

      for (let index = 1; index < layout.links.length; index += 1) {
        expect(
          layout.links[index].left,
          `${width}px target separation`,
        ).toBeGreaterThanOrEqual(layout.links[index - 1].right);
      }
    }
  });

  test("desktop navigation remains in the sticky top header", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const state = await page.evaluate(() => {
      const header = document.querySelector(".site-header");
      const navigation = document.querySelector(".site-navigation");

      return {
        headerPosition: getComputedStyle(header).position,
        navigationPosition: getComputedStyle(navigation).position,
      };
    });

    expect(state.headerPosition).toBe("sticky");
    expect(state.navigationPosition).not.toBe("fixed");
  });

  test("focused content remains above the compact navigation", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const action = page.locator(".hero__action").last();
    await action.focus();
    await action.scrollIntoViewIfNeeded();

    const positions = await page.evaluate(() => {
      const focused = document.activeElement.getBoundingClientRect();
      const navigation = document
        .querySelector(".site-navigation")
        .getBoundingClientRect();

      return {
        focusedBottom: focused.bottom,
        navigationTop: navigation.top,
      };
    });

    expect(positions.focusedBottom).toBeLessThanOrEqual(
      positions.navigationTop,
    );
  });
});
