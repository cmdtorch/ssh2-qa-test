import Link from "next/link";

import type { ProductListItem } from "../lib/api";
import Price from "./Price";
import styles from "./ProductCard.module.css";

export type CardProduct = Omit<ProductListItem, "gender">;

/** One catalog card: photo, name, prices; the whole card opens /products/<slug>. */
export default function ProductCard({ product }: { product: CardProduct }) {
  const onSale = product.sale_price !== null;
  return (
    <li className={styles.item}>
      <Link href={`/products/${product.slug}`} className={styles.card}>
        <span className={styles.photo}>
          {product.photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.photo} alt={product.name} loading="lazy" />
          )}
          {onSale && product.discount_percent !== null && (
            <span className={styles.badge} data-testid="discount-badge">
              {product.discount_percent}%
            </span>
          )}
        </span>
        <h3 className={styles.name}>{product.name}</h3>
        <span className={styles.prices}>
          {onSale ? (
            <>
              <s className={styles.old}>
                <Price value={product.regular_price} />
              </s>
              <Price value={product.sale_price!} className={styles.current} />
            </>
          ) : (
            <Price value={product.regular_price} className={styles.current} />
          )}
        </span>
      </Link>
    </li>
  );
}

export function ProductCardSkeleton() {
  return (
    <div
      className={styles.skeleton}
      data-testid="card-skeleton"
      aria-hidden="true"
    />
  );
}
