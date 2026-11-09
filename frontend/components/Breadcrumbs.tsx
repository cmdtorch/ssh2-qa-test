import Link from "next/link";

import styles from "./ProductPage.module.css";

export default function Breadcrumbs({ name }: { name: string }) {
  return (
    <nav aria-label="Breadcrumb" className={styles.crumbs}>
      <Link href="/">Home page</Link>
      <span aria-hidden="true"> / </span>
      <Link href="/products">Products</Link>
      <span aria-hidden="true"> / </span>
      <span aria-current="page">{name}</span>
    </nav>
  );
}
