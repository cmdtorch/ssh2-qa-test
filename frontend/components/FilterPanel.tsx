"use client";

import { useEffect, useRef, useState } from "react";

import { getProducts } from "../lib/api";
import { useApi } from "../lib/useApi";
import styles from "./FilterPanel.module.css";

export const GENDER_OPTIONS = [
  { value: "men", label: "Men's perfumes" },
  { value: "women", label: "Women's perfumes" },
  { value: "unisex", label: "Unisex perfumes" },
] as const;

export type GenderValue = (typeof GENDER_OPTIONS)[number]["value"];

/**
 * The marks are local until "See results"; closing drops them. The count is a
 * list request for the marked gender and the search text, taking only `total`
 * (it carries no `page`, so it is told apart from the catalog list request).
 */
export default function FilterPanel({
  applied,
  q,
  onApply,
  onClose,
}: {
  applied: GenderValue | undefined;
  q: string | undefined;
  onApply: (gender: GenderValue | undefined) => void;
  onClose: () => void;
}) {
  const [marked, setMarked] = useState<GenderValue | undefined>(applied);
  const [expanded, setExpanded] = useState(true);
  const closeRef = useRef<HTMLButtonElement>(null);
  const count = useApi(
    async (signal) => (await getProducts({ gender: marked, q }, signal)).total,
    `count:${marked ?? ""}:${q ?? ""}`,
  );

  useEffect(() => {
    closeRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const total = count.data;
  const label = total === null ? "See results" : `See results (${total})`;

  return (
    <div className={styles.overlay}>
      <div
        className={styles.backdrop}
        data-testid="filter-backdrop"
        onClick={onClose}
      />
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Filter"
      >
        <div className={styles.top}>
          <h2 className={styles.title}>
            <svg
              aria-hidden="true"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <circle cx="7" cy="8" r="2" />
              <path d="M11 8h9M4 16h9" />
              <circle cx="17" cy="16" r="2" />
            </svg>
            Filter
          </h2>
          <button
            ref={closeRef}
            type="button"
            className={styles.icon}
            aria-label="Close filters"
            onClick={onClose}
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
        <section className={styles.group}>
          <div className={styles.groupHead}>
            <h3 className={styles.groupTitle}>Gender</h3>
            <button
              type="button"
              className={styles.icon}
              aria-label={expanded ? "Collapse Gender" : "Expand Gender"}
              aria-expanded={expanded}
              onClick={() => setExpanded((e) => !e)}
            >
              <span aria-hidden="true">{expanded ? "−" : "+"}</span>
            </button>
          </div>
          {expanded && (
            <div
              role="radiogroup"
              aria-label="Gender"
              className={styles.options}
            >
              {GENDER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={marked === option.value}
                  className={styles.option}
                  onClick={() => setMarked(option.value)}
                >
                  <span className={styles.mark} aria-hidden="true" />
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </section>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.clear}
            onClick={() => setMarked(undefined)}
          >
            Clear
          </button>
          <button
            type="button"
            className={styles.apply}
            onClick={() => onApply(marked)}
          >
            {label}
          </button>
        </div>
      </div>
    </div>
  );
}
