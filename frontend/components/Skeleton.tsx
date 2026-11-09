import type { HTMLAttributes } from "react";

import styles from "./Skeleton.module.css";

/** A grey placeholder block; size it with `style` or a className. */
export default function Skeleton({
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={[styles.skeleton, className].filter(Boolean).join(" ")}
      {...rest}
    />
  );
}
