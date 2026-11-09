"use client";

import { useState } from "react";

import styles from "./Gallery.module.css";

export default function Gallery({
  photos,
  name,
}: {
  photos: string[];
  name: string;
}) {
  const [index, setIndex] = useState(0);
  const last = photos.length - 1;
  return (
    <div className={styles.gallery}>
      <ul className={styles.thumbs} aria-label="Photo thumbnails">
        {photos.map((src, i) => (
          <li key={`${src}:${i}`}>
            <button
              type="button"
              className={styles.thumb}
              aria-current={i === index ? "true" : undefined}
              onClick={() => setIndex(i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={name} />
            </button>
          </li>
        ))}
      </ul>
      <div className={styles.stage}>
        {photos.length > 0 && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            data-testid="gallery-photo"
            className={styles.photo}
            src={photos[index]}
            alt={name}
          />
        )}
        <div className={styles.arrows}>
          <button
            type="button"
            className={styles.arrow}
            aria-label="Previous photo"
            disabled={index <= 0}
            onClick={() => setIndex((n) => Math.max(0, n - 1))}
          >
            <svg
              aria-hidden="true"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 12H4M10 6l-6 6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            className={styles.arrow}
            aria-label="Next photo"
            disabled={index >= last}
            onClick={() => setIndex((n) => Math.min(last, n + 1))}
          >
            <svg
              aria-hidden="true"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 12h16M14 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
