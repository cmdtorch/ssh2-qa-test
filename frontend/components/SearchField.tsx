"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./SiteHeader.module.css";

/** Search text input; Enter submits the trimmed text (possibly empty). */
export default function SearchField({
  onSubmit,
}: {
  onSubmit: (text: string) => void;
}) {
  const [text, setText] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <form
      className={styles.searchForm}
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(text.trim());
      }}
    >
      <input
        ref={ref}
        type="search"
        className={styles.searchInput}
        aria-label="Search products"
        placeholder="Search"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </form>
  );
}
