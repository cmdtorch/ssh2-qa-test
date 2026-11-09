import { cleanup, render, screen, within } from "@testing-library/react";
import { Suspense } from "react";
import { afterEach, beforeEach, vi } from "vitest";

import ProductPage from "../components/ProductPage";
import SiteHeader from "../components/SiteHeader";
import type { ProductDetail } from "../lib/api";
import { StoreProvider } from "../lib/store";
import {
  installBackend,
  many,
  product,
  type Backend,
  type FakeProduct,
} from "./backend";
import { setUrl } from "./navigation";

/** Shared setup for the product page tests: mocks, cleanup and `open`. */
export function setupProductPage() {
  beforeEach(() => {
    window.localStorage.clear();
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });
}

export const GABRIELLE = product("Chanel Gabrielle", "women", 40);

/** Five more women's products, so "Chanel Gabrielle" has 4 related ones. */
export const CATALOG: FakeProduct[] = [
  ...many(5, "women", "Women"),
  GABRIELLE,
  product("Creed Aventus", "men", 150),
];

export function openProduct(
  slug = "chanel-gabrielle",
  options: {
    products?: FakeProduct[];
    details?: Record<string, Partial<ProductDetail>>;
    intercept?: Backend["intercept"];
  } = {},
): Backend {
  const backend = installBackend(options.products ?? CATALOG, options.details);
  backend.intercept = options.intercept;
  setUrl(`/products/${slug}`);
  render(
    <StoreProvider>
      <Suspense>
        <SiteHeader />
      </Suspense>
      <ProductPage slug={slug} />
    </StoreProvider>,
  );
  return backend;
}

export const main = () => within(screen.getByRole("main"));
