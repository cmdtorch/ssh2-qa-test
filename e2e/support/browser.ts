import type { Page } from "@playwright/test";

// Browser-side helpers shared by the specs.

export const BASKET_KEY = "lunisse.basket";
export const WISHLIST_KEY = "lunisse.wishlist";
export type BasketLine = { slug: string; volume: number; quantity: number };

/**
 * Puts a basket (array of {slug, volume, quantity}) and/or a wishlist (array
 * of slugs) into localStorage before every page script runs. A key is only
 * written when it is absent, so later reloads and navigations keep what the
 * application stored itself.
 */
export async function seedStorage(
  page: Page,
  data: { basket?: BasketLine[]; wishlist?: string[] },
): Promise<void> {
  await page.addInitScript(
    ({ basket, wishlist, basketKey, wishlistKey }) => {
      try {
        if (basket && localStorage.getItem(basketKey) === null) {
          localStorage.setItem(basketKey, JSON.stringify(basket));
        }
        if (wishlist && localStorage.getItem(wishlistKey) === null) {
          localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
        }
      } catch {
        /* blocked storage */
      }
    },
    { ...data, basketKey: BASKET_KEY, wishlistKey: WISHLIST_KEY },
  );
}

/** Makes every localStorage access throw, like a browser that blocks saving data. */
export async function blockStorage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("blocked", "SecurityError");
      },
    });
  });
}

export const AVAILABILITY = "**/api/products/availability/**";

/** Makes the availability check fail with a network error until `page.unroute(AVAILABILITY)`. */
export async function failAvailability(page: Page): Promise<void> {
  await page.route(AVAILABILITY, (route) => route.abort("connectionrefused"));
}

/** Reads a localStorage key (parsed JSON) from the page. */
export async function readStorage<T>(page: Page, key: string): Promise<T | null> {
  const raw = await page.evaluate((k) => localStorage.getItem(k), key);
  return raw === null ? null : (JSON.parse(raw) as T);
}

/**
 * The Django admin is not proxied by the frontend: it is served by the backend
 * on port 18000 of the same host (E2E_ADMIN_URL overrides it).
 */
export function adminUrl(path = "/admin/"): string {
  const base = process.env.E2E_ADMIN_URL ?? `${new URL(process.env.E2E_BASE_URL ?? "http://localhost:13000").protocol}//${new URL(process.env.E2E_BASE_URL ?? "http://localhost:13000").hostname}:18000`;
  return base.replace(/\/$/, "") + path;
}

/** Signs in to the Django admin with the given credentials (use a fresh browser context). */
export async function adminLogin(
  page: Page,
  user: { username: string; password: string },
): Promise<void> {
  await page.goto(adminUrl("/admin/login/?next=/admin/"));
  await page.locator("#id_username").fill(user.username);
  await page.locator("#id_password").fill(user.password);
  await page.locator('input[type="submit"]').click();
  await page.waitForURL("**/admin/");
}
