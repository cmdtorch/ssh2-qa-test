import styles from "./ProductPage.module.css";

type Star = "full" | "half" | "empty";

function stars(rating: number): Star[] {
  const halves = Math.round(Math.min(5, Math.max(0, rating)) * 2);
  return Array.from({ length: 5 }, (_, i) =>
    halves >= (i + 1) * 2 ? "full" : halves === i * 2 + 1 ? "half" : "empty",
  );
}

export default function RatingStars({ rating }: { rating: number }) {
  return (
    <span
      role="img"
      aria-label={`Rating ${rating} out of 5`}
      className={styles.stars}
    >
      {stars(rating).map((kind, i) => (
        <span key={i} data-star={kind} className={styles[`star_${kind}`]}>
          <svg
            aria-hidden="true"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          >
            <defs>
              <linearGradient id={`half-${i}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              d="M12 2.5 14.6 9.4 22 9.8l-5.8 4.6 2 7.1L12 17.4 5.8 21.5l2-7.1L2 9.8l7.4-.4L12 2.5Z"
              fill={
                kind === "full"
                  ? "currentColor"
                  : kind === "half"
                    ? `url(#half-${i})`
                    : "none"
              }
            />
          </svg>
        </span>
      ))}
    </span>
  );
}
