"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";

import { useStore } from "../lib/store";
import SearchField from "./SearchField";
import styles from "./SiteHeader.module.css";

export const INFO_LINKS = ["About us", "Brands", "Blog", "Video", "Support"];

export const CATEGORIES = [
  { label: "Perfumes", href: "/products" },
  { label: "Men's perfumes", href: "/products?gender=men" },
  { label: "Women's perfumes", href: "/products?gender=women" },
  { label: "Unisex perfumes", href: "/products?gender=unisex" },
];

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export default function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { totalUnits } = useStore();
  const [searchOpen, setSearchOpen] = useState(false);

  function submit(text: string) {
    const next = new URLSearchParams();
    // Gender and sort are kept only when searching from the catalog itself.
    if (pathname === "/products") {
      for (const key of ["gender", "sort"]) {
        const value = params.get(key);
        if (value) next.set(key, value);
      }
    }
    if (text) next.set("q", text);
    const query = next.toString();
    router.push(query ? `/products?${query}` : "/products");
  }

  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <ul className={styles.info}>
          {INFO_LINKS.map((label) => (
            <li key={label}>
              <span className={styles.inactive}>{label}</span>
            </li>
          ))}
        </ul>
        <Link href="/" className={styles.logo}>
          Lunisse
        </Link>
        <div className={styles.icons}>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Search"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((open) => !open)}
          >
            <Icon>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </Icon>
          </button>
          <Link
            href="/wishlist"
            className={styles.iconButton}
            aria-label="Wishlist"
          >
            <Icon>
              <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
            </Icon>
          </Link>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Account"
          >
            <Icon>
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
            </Icon>
          </button>
          <Link
            href="/basket"
            className={styles.iconButton}
            aria-label="Basket"
          >
            <Icon>
              <path d="M5 8h14l-1 12H6L5 8Z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </Icon>
            {totalUnits > 0 && (
              <span
                className={styles.counter}
                data-testid="basket-counter"
                aria-hidden="true"
              >
                {totalUnits}
              </span>
            )}
          </Link>
        </div>
      </div>
      {searchOpen && (
        <div className={styles.searchRow}>
          <SearchField onSubmit={submit} />
        </div>
      )}
      <nav className={styles.categories} aria-label="Categories">
        <ul>
          {CATEGORIES.map(({ label, href }) => (
            <li key={label}>
              <Link href={href}>{label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
