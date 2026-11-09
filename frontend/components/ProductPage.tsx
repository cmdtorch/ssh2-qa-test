"use client";

import { useEffect, useRef, useState } from "react";

import { ApiError, getProduct, type ProductDetail } from "../lib/api";
import { MAX_QUANTITY, useAvailabilityCheck, useStore } from "../lib/store";
import { useApi } from "../lib/useApi";
import Breadcrumbs from "./Breadcrumbs";
import ErrorState from "./ErrorState";
import Gallery from "./Gallery";
import NotFoundState from "./NotFoundState";
import Price from "./Price";
import styles from "./ProductPage.module.css";
import QuantityStepper from "./QuantityStepper";
import RatingStars from "./RatingStars";
import RelatedProducts from "./RelatedProducts";
import Section from "./Section";
import Skeleton from "./Skeleton";
import SizeToggles from "./SizeToggles";
import WishlistHeart from "./WishlistHeart";

const LIMIT_MESSAGE = `You can add at most ${MAX_QUANTITY} of one product`;
const CONFIRMATION_MS = 3000;

export default function ProductPage({ slug }: { slug: string }) {
  useAvailabilityCheck();
  const { loading, error, data, retry } = useApi(
    (signal) => getProduct(slug, signal),
    `product:${slug}`,
  );

  if (error instanceof ApiError && error.status === 404) {
    return <NotFoundState />;
  }
  if (error) {
    return (
      <main className={styles.main}>
        <ErrorState message="Could not load the product" onRetry={retry} />
      </main>
    );
  }
  if (loading || !data) {
    return (
      <main className={styles.main} aria-busy="true">
        <div className={styles.layout}>
          <Skeleton
            data-testid="photo-placeholder"
            className={styles.phPhoto}
          />
          <div className={styles.info}>
            <Skeleton
              data-testid="name-placeholder"
              className={styles.phName}
            />
            <Skeleton
              data-testid="price-placeholder"
              className={styles.phPrice}
            />
          </div>
        </div>
      </main>
    );
  }
  return <ProductView key={data.slug} product={data} />;
}

function ProductView({ product }: { product: ProductDetail }) {
  const store = useStore();
  const [volume, setVolume] = useState(
    (product.sizes.find((s) => s.is_default) ?? product.sizes[0])?.volume ?? 0,
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const size = product.sizes.find((s) => s.volume === volume);
  const inWishlist = store.isInWishlist(product.slug);

  function add() {
    store.addToBasket(product.slug, volume, quantity);
    setQuantity(1);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), CONFIRMATION_MS);
  }

  function choose(next: number) {
    store.dismissLimit();
    setVolume(next);
  }

  return (
    <main className={styles.main}>
      <Breadcrumbs name={product.name} />
      <h1 className={styles.title}>{product.name.toUpperCase()}</h1>
      <div className={styles.layout} data-testid="product-layout">
        <Gallery photos={product.photos} name={product.name} />
        <div className={styles.info}>
          <div className={styles.head}>
            <p className={styles.name}>{product.name}</p>
            {size && (
              <p className={styles.price} data-testid="top-price">
                {size.sale_price !== null ? (
                  <>
                    <s className={styles.old}>
                      <Price value={size.regular_price} />
                    </s>{" "}
                    <Price value={size.sale_price} className={styles.sale} />
                  </>
                ) : (
                  <Price value={size.regular_price} />
                )}
              </p>
            )}
          </div>
          {product.descriptor_line && (
            <p className={styles.descriptor} data-testid="descriptor-line">
              {product.descriptor_line}
            </p>
          )}
          {typeof product.rating === "number" && (
            <RatingStars rating={product.rating} />
          )}
          <QuantityStepper value={quantity} onChange={setQuantity} />
          <div className={styles.actions}>
            <WishlistHeart
              filled={inWishlist}
              onToggle={() => store.toggleWishlist(product.slug)}
            />
            <button type="button" className={styles.add} onClick={add}>
              <svg
                aria-hidden="true"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              >
                <path d="M5 8h14l-1 12H6L5 8Z" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" />
              </svg>
              Add to basket
            </button>
          </div>
          <p className={styles.message} role="status">
            {store.limitReached
              ? LIMIT_MESSAGE
              : added
                ? "Added to basket"
                : ""}
          </p>

          <Section
            title="Size"
            open={sizeOpen}
            onToggle={() => setSizeOpen(!sizeOpen)}
          >
            <SizeToggles
              sizes={product.sizes}
              chosen={volume}
              onChoose={choose}
            />
          </Section>
          <Section title="Product description" defaultOpen>
            <p className={styles.text}>{product.description}</p>
          </Section>
          <Section title="Notes" defaultOpen>
            <div className={styles.notes}>
              {(
                [
                  ["Top notes", product.top_notes],
                  ["Heart notes", product.heart_notes],
                  ["Base notes", product.base_notes],
                ] as const
              ).map(([label, text], index) => (
                <div key={label} className={styles.note}>
                  <svg
                    aria-hidden="true"
                    className={styles.noteIcon}
                    width="44"
                    height="62"
                    viewBox="0 0 44 62"
                  >
                    <rect x="14" y="0" width="16" height="6" fill="#e6a09a" />
                    <rect
                      x="1"
                      y="8"
                      width="42"
                      height="52"
                      rx="3"
                      fill="#fff"
                      stroke="#e63950"
                      strokeWidth="2"
                    />
                    <rect
                      x="1"
                      y={[9, 26, 43][index]}
                      width="42"
                      height="17"
                      fill="#e63950"
                    />
                    <path
                      d="M1 26h42M1 43h42"
                      stroke="#e63950"
                      strokeWidth="2"
                    />
                  </svg>
                  <span className={styles.noteText}>
                    <span className={styles.noteLabel}>{label}</span>
                    <span className={styles.text}>{text}</span>
                  </span>
                </div>
              ))}
            </div>
          </Section>
          <Section title="Ingredients" defaultOpen>
            <p className={styles.text}>{product.ingredients}</p>
          </Section>
          <Section title="Shipping & handling">
            <p className={styles.text}>{product.shipping}</p>
          </Section>
          <Section title="Questions">
            <p className={styles.text}>{product.questions}</p>
          </Section>
        </div>
      </div>
      <RelatedProducts products={product.related} />
    </main>
  );
}
