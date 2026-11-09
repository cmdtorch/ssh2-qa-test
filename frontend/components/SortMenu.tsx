"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./SortMenu.module.css";

export const SORT_OPTIONS = [
  { value: "new", label: "New" },
  { value: "price-asc", label: "Price low to high" },
  { value: "price-desc", label: "Price high to low" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export default function SortMenu({
  value,
  onChange,
}: {
  value: SortValue;
  onChange: (value: SortValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const current = SORT_OPTIONS.find((o) => o.value === value)!;

  useEffect(() => {
    if (!open) return;
    function close(event: Event) {
      if (
        event instanceof KeyboardEvent
          ? event.key === "Escape"
          : !root.current?.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", close);
    document.addEventListener("mousedown", close);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("mousedown", close);
    };
  }, [open]);

  return (
    <div className={styles.root} ref={root}>
      <button
        type="button"
        className={styles.button}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span>Sort by</span>
        <span className={styles.value}>{current.label}</span>
        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className={styles.menu} role="menu" aria-label="Sort by">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={option.value === value}
              className={styles.option}
              onClick={() => {
                setOpen(false);
                onChange(option.value);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
