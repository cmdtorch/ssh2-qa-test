"use client";

import Link from "next/link";

import type { AvailableItem } from "../lib/api";
import { useAvailabilityCheck, useStore } from "../lib/store";
import ErrorState from "./ErrorState";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";
import styles from "./WishlistPage.module.css";

export default function WishlistPage() {
  const { ready, wishlist } = useStore();
  // One availability request per open: it removes unavailable products and
  // also brings the card data (the default size's prices) shown here.
  const { loading, error, results, retry } = useAvailabilityCheck();

  const available = new Map<string, AvailableItem>();
  for (const result of results) {
    if (result.available) available.set(result.item, result);
  }

  let content;
  if (!ready) {
    content = null;
  } else if (wishlist.length === 0) {
    content = (
      <div className={styles.empty}>
        <p>Your wishlist is empty</p>
        <Link href="/products" className={styles.link}>
          Go to the catalog
        </Link>
      </div>
    );
  } else if (error) {
    content = (
      <ErrorState message="Could not load the wishlist" onRetry={retry} />
    );
  } else if (loading) {
    content = (
      <div className={styles.grid} aria-busy="true">
        {wishlist.map((slug) => (
          <ProductCardSkeleton key={slug} />
        ))}
      </div>
    );
  } else {
    content = (
      <ul className={styles.grid}>
        {wishlist.flatMap((slug) => {
          const item = available.get(slug);
          return item
            ? [
                <ProductCard
                  key={slug}
                  product={{
                    slug,
                    name: item.name,
                    photo: item.photo,
                    regular_price: item.regular_price,
                    sale_price: item.sale_price,
                    discount_percent: item.discount_percent,
                  }}
                />,
              ]
            : [];
        })}
      </ul>
    );
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Wishlist</h1>
      {content}
    </main>
  );
}
