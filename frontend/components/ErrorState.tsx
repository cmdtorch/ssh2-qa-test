import styles from "./ErrorState.module.css";

export default function ErrorState({
  message = "Could not load",
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <div className={styles.error} role="alert">
      <p className={styles.text}>{message}</p>
      <button type="button" className={styles.button} onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}
