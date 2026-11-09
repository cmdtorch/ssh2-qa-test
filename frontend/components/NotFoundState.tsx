import Link from "next/link";

import styles from "./NotFoundState.module.css";

/** The "Page not found" content: used by the unknown-address page and the product page. */
export default function NotFoundState() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Page not found</h1>
      <Link href="/products" className={styles.link}>
        Back to catalog
      </Link>
    </main>
  );
}
