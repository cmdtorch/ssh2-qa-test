"use client";

import { useId, useState, type ReactNode } from "react";

import styles from "./ProductPage.module.css";

/** A collapsible block: the title row is one button, "−" when open and "+" when closed. */
export default function Section({
  title,
  defaultOpen,
  open: controlledOpen,
  onToggle,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  open?: boolean;
  onToggle?: () => void;
  children: ReactNode;
}) {
  const [inner, setInner] = useState(defaultOpen ?? false);
  const open = controlledOpen ?? inner;
  const id = useId();
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={onToggle ?? (() => setInner(!inner))}
        >
          <span>{title}</span>
          <span aria-hidden="true">{open ? "−" : "+"}</span>
        </button>
      </h2>
      {open && <div id={id}>{children}</div>}
    </section>
  );
}
