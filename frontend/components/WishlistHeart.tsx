import styles from "./ProductPage.module.css";

export default function WishlistHeart({
  filled,
  onToggle,
}: {
  filled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className={styles.heart}
      aria-label={filled ? "Remove from wishlist" : "Add to wishlist"}
      data-filled={filled}
      onClick={onToggle}
    >
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path
          d="M12 21s-7.5-4.6-9.5-9.2C1.2 8.6 3 5.5 6.2 5.5c2 0 3.4 1.1 4.3 2.4h3c.9-1.3 2.3-2.4 4.3-2.4 3.2 0 5 3.1 3.7 6.3C19.5 16.4 12 21 12 21z"
          fill={filled ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
