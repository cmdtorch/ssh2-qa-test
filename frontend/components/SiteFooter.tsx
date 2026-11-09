import Link from "next/link";
import type { ReactNode } from "react";

import styles from "./SiteFooter.module.css";
import { INFO_LINKS } from "./SiteHeader";

const COLUMNS: [string, string[]][] = [
  [
    "Perfumes",
    [
      "On Sale",
      "Exclusive Collections",
      "Selected Fragrances",
      "Niche Perfumes",
      "Gift Sets",
    ],
  ],
  [
    "Men's perfumes",
    [
      "Luxury Perfumes",
      "Long-Lasting Scents",
      "Summer Fragrances",
      "Unisex Perfumes",
      "Men's favorite",
    ],
  ],
  [
    "Women's perfumes",
    [
      "Floral Scents",
      "Elegant Fragrances",
      "Women's favorite",
      "Romantic Fragrances",
      "Daily Wear Perfumes",
    ],
  ],
  [
    "Unisex perfumes",
    [
      "Fresh Scents",
      "Woody Aromas",
      "Citrus Blends",
      "Musk & Amber Notes",
      "Minimalist Fragrances",
    ],
  ],
];

const SOCIAL = ["Instagram", "Facebook", "TikTok", "YouTube"];

const ICONS: Record<string, ReactNode> = {
  Instagram: (
    <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm5 5.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm0 2a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm5.5-4a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
  ),
  Facebook: (
    <path d="M14 22v-8h3l.5-4H14V8c0-1 .4-2 2-2h1.6V2.4C17.3 2.3 16.3 2 15 2c-3 0-5 1.8-5 5v3H7v4h3v8h4Z" />
  ),
  TikTok: (
    <path d="M16 2h-3.5v13.5a2.5 2.5 0 1 1-2.5-2.5c.3 0 .5 0 .8.1V9.4A6 6 0 1 0 16 15V8.8A7 7 0 0 0 20 10V6.5A4 4 0 0 1 16 2Z" />
  ),
  YouTube: (
    <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8C2 8.800 2 12 2 12s0 3.200.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.800 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8C22 15.200 22 12 22 12s0-3.200-.4-4.8ZM10 15V9l5 3-5 3Z" />
  ),
};

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <Link href="/" className={styles.logo}>
            Lunisse
          </Link>
          <ul className={styles.info}>
            {INFO_LINKS.map((label) => (
              <li key={label}>
                <span className={styles.inactive}>{label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.columns}>
          {COLUMNS.map(([title, items]) => (
            <section key={title}>
              <h2 className={styles.columnTitle}>{title}</h2>
              <ul>
                {items.map((item) => (
                  <li key={item}>
                    <span className={styles.inactive}>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <section>
            <h2 className={styles.columnTitle}>Contact us</h2>
            <p className={styles.contact}>Address: 27 Whitestone Avenue</p>
            <p className={styles.contact}>Phone: +44 7480 123456</p>
            <p className={styles.contact}>Mail: lunisse@gmail.com</p>
          </section>
        </div>
        <div className={styles.bottom}>
          <span>2025 © All Rights Reserved</span>
          <ul className={styles.social}>
            {SOCIAL.map((name) => (
              <li key={name}>
                <span
                  className={styles.inactive}
                  title={name}
                  aria-label={name}
                  role="img"
                >
                  <svg
                    aria-hidden="true"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    {ICONS[name]}
                  </svg>
                </span>
              </li>
            ))}
          </ul>
          <span className={styles.legal}>
            <span className={styles.inactive}>Terms and Conditions</span>
            <span className={styles.inactive}>Privacy Policy</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
