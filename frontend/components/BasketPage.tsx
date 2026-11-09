"use client";

import Link from "next/link";

import type { AvailableItem } from "../lib/api";
import { useAvailabilityCheck, useStore } from "../lib/store";
import styles from "./BasketPage.module.css";
import ErrorState from "./ErrorState";
import Price from "./Price";
import QuantityStepper from "./QuantityStepper";
import Skeleton from "./Skeleton";

/** Whole cents, so sums such as 3 × 81.60 stay exact. */
const cents = (value: number) => Math.round(value * 100);

function unitPrice(item: AvailableItem): number {
  return item.sale_price ?? item.regular_price;
}

export default function BasketPage() {
  const { ready, basket, setQuantity, removeLine } = useStore();
  // One availability request per open: it removes unavailable lines and also
  // brings the current prices shown here.
  const { loading, error, results, retry } = useAvailabilityCheck();

  const available = new Map<string, AvailableItem>();
  for (const result of results) {
    if (result.available) available.set(result.item, result);
  }

  let content;
  if (!ready) {
    content = null;
  } else if (basket.length === 0) {
    content = (
      <div className={styles.empty}>
        <p>Your basket is empty</p>
        <Link href="/products" className={styles.link}>
          Go to the catalog
        </Link>
      </div>
    );
  } else if (error) {
    content = (
      <ErrorState message="Could not load the basket" onRetry={retry} />
    );
  } else if (loading) {
    content = (
      <ul className={styles.lines} aria-busy="true">
        {basket.map((line) => (
          <li key={`${line.slug}:${line.volume}`} className={styles.line}>
            <Skeleton
              data-testid="line-placeholder"
              className={styles.placeholder}
            />
          </li>
        ))}
      </ul>
    );
  } else {
    const shown = basket.flatMap((line) => {
      const item = available.get(`${line.slug}:${line.volume}`);
      return item ? [{ line, item }] : [];
    });
    const totalCents = shown.reduce(
      (sum, { line, item }) => sum + cents(unitPrice(item)) * line.quantity,
      0,
    );
    content = (
      <>
        <ul className={styles.lines}>
          {shown.map(({ line, item }) => (
            <li key={`${line.slug}:${line.volume}`} className={styles.line}>
              <span className={styles.photo}>
                {item.photo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.photo} alt={item.name} />
                )}
              </span>
              <div className={styles.info}>
                <Link href={`/products/${line.slug}`} className={styles.name}>
                  {item.name}
                </Link>
                <span className={styles.size}>{line.volume} ml</span>
                <span className={styles.unit} data-testid="unit-price">
                  <Price
                    value={unitPrice(item)}
                    className={item.sale_price !== null ? styles.sale : ""}
                  />
                </span>
              </div>
              <div className={styles.controls}>
                <QuantityStepper
                  value={line.quantity}
                  onChange={(q) => setQuantity(line.slug, line.volume, q)}
                />
                <button
                  type="button"
                  className={styles.remove}
                  aria-label="Remove from basket"
                  onClick={() => removeLine(line.slug, line.volume)}
                >
                  Remove
                </button>
              </div>
              <span className={styles.lineTotal} data-testid="line-total">
                <Price value={(cents(unitPrice(item)) * line.quantity) / 100} />
              </span>
            </li>
          ))}
        </ul>
        <p className={styles.total}>
          <span>Total</span>
          <span data-testid="basket-total">
            <Price value={totalCents / 100} />
          </span>
        </p>
      </>
    );
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Basket</h1>
      {content}
    </main>
  );
}
