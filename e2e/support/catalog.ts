import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { Page } from "@playwright/test";

// Exact catalog states for the catalog-page specs. The product list is
// replaced by the given products (one docker exec), so a case can name its
// own counts, prices and dates. Products have one default 100 ml size.

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export type Item = {
  name: string;
  gender: "men" | "women" | "unisex";
  price?: number;
  sale?: number;
  /** ISO date, e.g. 2026-10-01 */
  added?: string;
};

export function buildCatalog(items: Item[]): void {
  const code =
    `import json\n` +
    `from decimal import Decimal\n` +
    `from datetime import datetime, timezone\n` +
    `from catalog.models import Product, ProductSize\n` +
    `Product.objects.all().delete()\n` +
    `for i in json.loads(${JSON.stringify(JSON.stringify(items))}):\n` +
    ` p = Product.objects.create(name=i['name'], gender=i['gender'], description='d')\n` +
    ` ProductSize.objects.create(product=p, volume=100, is_default=True, regular_price=Decimal(str(i.get('price', 100))), sale_price=Decimal(str(i['sale'])) if i.get('sale') else None)\n` +
    ` if i.get('added'): Product.objects.filter(pk=p.pk).update(date_added=datetime.fromisoformat(i['added']).replace(tzinfo=timezone.utc))\n`;
  execFileSync(
    "docker",
    ["compose", "-p", "setup-monorepo-e2e", "-f", "docker-compose.yml", "-f", "docker-compose.e2e.yml",
      "exec", "-T", "backend", "python", "manage.py", "shell", "-c", code],
    { cwd: repoRoot, encoding: "utf8" },
  );
}

/** n products of a gender named "<prefix> 001"...; prices rise with the number unless `price` is given. */
export function many(
  n: number,
  gender: Item["gender"],
  prefix = `Bulk ${gender}`,
  price?: (i: number) => number,
): Item[] {
  return Array.from({ length: n }, (_, k) => ({
    name: `${prefix} ${String(k + 1).padStart(3, "0")}`,
    gender,
    price: price ? price(k + 1) : 100 + k,
  }));
}

export const cards = (page: Page) =>
  page.getByRole("list", { name: "Products" }).getByRole("listitem");
export const cardNames = (page: Page) => cards(page).locator("h3");
export const pagination = (page: Page) => page.getByRole("navigation", { name: "Pagination" });
export const LIST = "**/api/products/?*";

/** True for the list request of the catalog (it carries `page`), false for the count request. */
export const isListRequest = (url: string) => new URL(url).searchParams.has("page");
export const isCountRequest = (url: string) => {
  const u = new URL(url);
  return u.pathname === "/api/products/" && !u.searchParams.has("page");
};
