import type { ProductListItem } from "../lib/api";
import ProductCard from "./ProductCard";
import styles from "./ProductPage.module.css";

export default function RelatedProducts({
  products,
}: {
  products: ProductListItem[];
}) {
  if (products.length === 0) return null;
  return (
    <section className={styles.related}>
      <h2 className={styles.relatedTitle}>YOU MAY ALSO LIKE</h2>
      <ul className={styles.relatedGrid} aria-label="Related products">
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </ul>
    </section>
  );
}
