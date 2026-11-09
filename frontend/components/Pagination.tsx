import styles from "./Pagination.module.css";

/** Page numbers; the caller renders it only when there is more than one page. */
export default function Pagination({
  page,
  pages,
  onChange,
}: {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}) {
  return (
    <nav className={styles.pagination} aria-label="Pagination">
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          className={
            n === page ? `${styles.page} ${styles.current}` : styles.page
          }
          aria-current={n === page ? "page" : undefined}
          onClick={() => onChange(n)}
        >
          {n}
        </button>
      ))}
    </nav>
  );
}
