import { MAX_QUANTITY } from "../lib/store";
import styles from "./ProductPage.module.css";

export default function QuantityStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className={styles.stepper}>
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <span aria-hidden="true">−</span>
      </button>
      <span data-testid="quantity" className={styles.quantity}>
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={value >= MAX_QUANTITY}
        onClick={() => onChange(value + 1)}
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  );
}
