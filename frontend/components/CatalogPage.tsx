"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";

import { getProducts } from "../lib/api";
import { useAvailabilityCheck } from "../lib/store";
import { useApi } from "../lib/useApi";
import styles from "./CatalogPage.module.css";
import ErrorState from "./ErrorState";
import FilterPanel, { GENDER_OPTIONS, type GenderValue } from "./FilterPanel";
import Pagination from "./Pagination";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";
import SortMenu, { SORT_OPTIONS, type SortValue } from "./SortMenu";

const PAGE_SIZE = 16;

function parseGender(value: string | null): GenderValue | undefined {
  return GENDER_OPTIONS.find((o) => o.value === value)?.value;
}

function parseSort(value: string | null): SortValue {
  return SORT_OPTIONS.find((o) => o.value === value)?.value ?? "new";
}

function parsePage(value: string | null): number {
  return value !== null && /^\d+$/.test(value) && Number(value) >= 1
    ? Number(value)
    : 1;
}

export default function CatalogPage() {
  useAvailabilityCheck();
  const router = useRouter();
  const params = useSearchParams();
  const [panelOpen, setPanelOpen] = useState(false);
  const filterButton = useRef<HTMLButtonElement>(null);

  const gender = parseGender(params.get("gender"));
  const sort = parseSort(params.get("sort"));
  const page = parsePage(params.get("page"));
  const q = params.get("q")?.trim() || undefined;

  /** Opens the catalog with the given changes; undefined removes a parameter. */
  const navigate = useCallback(
    (changes: Record<string, string | undefined>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value === undefined) next.delete(key);
        else next.set(key, value);
      }
      const query = next.toString();
      router.push(query ? `/products?${query}` : "/products");
    },
    [params, router],
  );

  const list = useApi(
    (signal) => getProducts({ gender, sort, page, q }, signal),
    `list:${gender ?? ""}:${sort}:${page}:${q ?? ""}`,
  );

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    filterButton.current?.focus();
  }, []);

  const data = list.data;

  return (
    <main className={styles.main}>
      <nav aria-label="Breadcrumb" className={styles.crumbs}>
        <Link href="/">Home page</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">Products</span>
      </nav>
      <h1 className={styles.title}>PRODUCTS</h1>
      <p className={styles.intro}>
        From confident business notes to romantic whispers, vibrant youth to
        timeless elegance — explore fragrances crafted for every mood and
        moment.
      </p>
      <div className={styles.toolbar}>
        <button
          ref={filterButton}
          type="button"
          className={styles.filterButton}
          aria-haspopup="dialog"
          onClick={() => setPanelOpen(true)}
        >
          <svg
            aria-hidden="true"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <circle cx="7" cy="8" r="2" />
            <path d="M11 8h9M4 16h9" />
            <circle cx="17" cy="16" r="2" />
          </svg>
          Filter
        </button>
        <SortMenu
          value={sort}
          onChange={(value) => navigate({ sort: value, page: undefined })}
        />
      </div>

      {list.error ? (
        <ErrorState message="Could not load products" onRetry={list.retry} />
      ) : list.loading ? (
        <div className={styles.grid} aria-busy="true">
          {Array.from({ length: PAGE_SIZE }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : data && data.results.length > 0 ? (
        <>
          <ul className={styles.grid} aria-label="Products">
            {data.results.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </ul>
          {data.pages > 1 && (
            <Pagination
              page={data.page}
              pages={data.pages}
              onChange={(n) =>
                navigate({ page: n === 1 ? undefined : String(n) })
              }
            />
          )}
        </>
      ) : (
        <div className={styles.empty}>
          <p>Nothing found</p>
          <button
            type="button"
            className={styles.reset}
            onClick={() =>
              navigate({ gender: undefined, q: undefined, page: undefined })
            }
          >
            Reset filters
          </button>
        </div>
      )}

      {panelOpen && (
        <FilterPanel
          applied={gender}
          q={q}
          onClose={closePanel}
          onApply={(chosen) => {
            navigate({ gender: chosen, page: undefined });
            closePanel();
          }}
        />
      )}
    </main>
  );
}
