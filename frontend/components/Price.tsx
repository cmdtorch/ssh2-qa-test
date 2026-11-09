const formatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** $40, $81.60, $1,250: whole amounts without decimals, otherwise two decimals. */
export function formatPrice(value: number): string {
  const cents = Math.round(value * 100);
  const text =
    cents % 100 === 0
      ? new Intl.NumberFormat("en-US").format(cents / 100)
      : formatter.format(cents / 100);
  return `$${text}`;
}

export default function Price({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return <span className={className}>{formatPrice(value)}</span>;
}
