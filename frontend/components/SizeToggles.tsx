import type { ProductSize } from "../lib/api";
import Price from "./Price";
import styles from "./ProductPage.module.css";

export default function SizeToggles({
  sizes,
  chosen,
  onChoose,
}: {
  sizes: ProductSize[];
  chosen: number;
  onChoose: (volume: number) => void;
}) {
  return (
    <div className={styles.sizes}>
      {sizes.map((size) => (
        <button
          key={size.volume}
          type="button"
          className={styles.size}
          aria-pressed={size.volume === chosen}
          onClick={() => onChoose(size.volume)}
        >
          <span className={styles.sizeVolume}>{size.volume} ml</span>{" "}
          <Price value={size.sale_price ?? size.regular_price} />
        </button>
      ))}
    </div>
  );
}
