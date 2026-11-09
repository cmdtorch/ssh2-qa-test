import { vi } from "vitest";

import type { ProductDetail } from "../lib/api";

export type FakeProduct = {
  name: string;
  gender: "men" | "women" | "unisex";
  regular: number;
  sale?: number;
  /** Hidden products are unavailable (as if "show on site" were off). */
  hidden?: boolean;
};

/** Products are given oldest first; the "new" sort puts the last one first. */
export function product(
  name: string,
  gender: FakeProduct["gender"] = "women",
  regular = 100,
  sale?: number,
): FakeProduct {
  return { name, gender, regular, sale };
}

export function many(
  count: number,
  gender: FakeProduct["gender"] = "women",
  prefix = "Perfume",
): FakeProduct[] {
  return Array.from({ length: count }, (_, i) =>
    product(
      `${prefix} ${String(i + 1).padStart(2, "0")}`,
      gender,
      (i + 1) * 10,
    ),
  );
}

export const slugOf = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const PAGE_SIZE = 16;

export type Backend = {
  /** Every requested address (path and query), in order. */
  requests: string[];
  /**
   * Return a Response to answer yourself, "network" to fail like an
   * unreachable backend, a promise to delay, or undefined to answer normally.
   * Catalog list requests always carry `page`; count requests never do.
   */
  intercept?: (
    url: URL,
  ) => Response | Promise<Response> | "network" | undefined;
};

function current(p: FakeProduct) {
  return p.sale ?? p.regular;
}

function listAnswer(products: FakeProduct[], url: URL) {
  const gender = url.searchParams.get("gender");
  const sort = url.searchParams.get("sort") || "new";
  const q = (url.searchParams.get("q") ?? "").toLowerCase();
  const order = products.map((p, index) => ({ p, index }));
  let rows = order.filter(
    ({ p }) =>
      (!gender || p.gender === gender) && p.name.toLowerCase().includes(q),
  );
  if (sort === "new") rows = rows.reverse();
  else {
    const sign = sort === "price-asc" ? 1 : -1;
    rows = rows.sort(
      (a, b) =>
        sign * (current(a.p) - current(b.p)) ||
        a.p.name.localeCompare(b.p.name),
    );
  }
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const page = Math.min(
    Math.max(Number(url.searchParams.get("page") || 1), 1),
    pages,
  );
  const results = rows
    .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    .map(({ p }) => ({
      slug: slugOf(p.name),
      name: p.name,
      gender: p.gender,
      photo: `/media/${slugOf(p.name)}.jpg`,
      regular_price: p.regular,
      sale_price: p.sale ?? null,
      discount_percent: p.sale
        ? Math.round((1 - p.sale / p.regular) * 100)
        : null,
    }));
  return { total: rows.length, pages, page, results };
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const SHIPPING_TEXT = "Free delivery over $100";
export const QUESTIONS_TEXT = "How long does a scent last? Up to 8 hours.";

/** The detail answer for a fake product; `overrides` replaces any field. */
function detailOf(
  products: FakeProduct[],
  p: FakeProduct,
  overrides: Partial<ProductDetail> = {},
): ProductDetail {
  const slug = slugOf(p.name);
  const related = products
    .filter((o) => o.gender === p.gender && o.name !== p.name)
    .reverse()
    .slice(0, 4)
    .map((o) => ({
      slug: slugOf(o.name),
      name: o.name,
      gender: o.gender,
      photo: `/media/${slugOf(o.name)}.jpg`,
      regular_price: o.regular,
      sale_price: o.sale ?? null,
      discount_percent: o.sale
        ? Math.round((1 - o.sale / o.regular) * 100)
        : null,
    }));
  return {
    slug,
    name: p.name,
    gender: p.gender,
    photos: [1, 2, 3, 4].map((n) => `/media/${slug}-${n}.jpg`),
    sizes: [
      { volume: 15, regular_price: 20 },
      { volume: 30, regular_price: 40, is_default: true },
      { volume: 50, regular_price: 80 },
    ].map((s) => ({
      volume: s.volume,
      is_default: s.is_default ?? false,
      regular_price: s.regular_price,
      sale_price: null,
      discount_percent: null,
    })),
    description: `About ${p.name}`,
    top_notes: "African Marigold, Bergamot, Buchu",
    heart_notes: "Cyclamen, Violet",
    base_notes: "Cedarwood, Vetiver",
    ingredients: "Alcohol, Parfum (Fragrance), Aqua (Water)",
    shipping: SHIPPING_TEXT,
    questions: QUESTIONS_TEXT,
    related,
    ...overrides,
  };
}

function availabilityAnswer(
  products: FakeProduct[],
  details: Record<string, Partial<ProductDetail>>,
  url: URL,
) {
  const items = (url.searchParams.get("items") ?? "").split(",");
  return items.map((item) => {
    const [slug, volume] = item.split(":");
    const found = products.find((p) => slugOf(p.name) === slug);
    if (!found || found.hidden) return { item, available: false };
    const size = detailOf(products, found, details[slug]).sizes.find((s) =>
      volume === undefined ? s.is_default : s.volume === Number(volume),
    );
    if (!size) return { item, available: false };
    return {
      item,
      available: true,
      slug,
      name: found.name,
      photo: `/media/${slug}.jpg`,
      volume: size.volume,
      regular_price: size.regular_price,
      sale_price: size.sale_price,
      discount_percent: size.discount_percent,
    };
  });
}

/**
 * Detail answers are built from `products` (unknown slugs answer 404);
 * `details` replaces fields of the answer by product slug.
 */
export function installBackend(
  products: FakeProduct[],
  details: Record<string, Partial<ProductDetail>> = {},
): Backend {
  const backend: Backend = { requests: [] };
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input), "http://localhost");
      backend.requests.push(url.pathname + url.search);
      const custom = backend.intercept?.(url);
      if (custom === "network") throw new TypeError("Failed to fetch");
      if (custom !== undefined) return custom;
      if (url.pathname === "/api/products/availability/") {
        return json({ results: availabilityAnswer(products, details, url) });
      }
      const detail = url.pathname.match(/^\/api\/products\/([^/]+)\/$/);
      if (detail) {
        const found = products.find((p) => slugOf(p.name) === detail[1]);
        return found
          ? json(detailOf(products, found, details[detail[1]]))
          : json({ error: "not found" }, 404);
      }
      return json(listAnswer(products, url));
    }),
  );
  return backend;
}

export const failing = (status = 500) => json({ error: "boom" }, status);
