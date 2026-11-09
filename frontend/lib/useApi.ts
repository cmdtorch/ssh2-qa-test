"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Settled<T> = { id: string; data: T | null; error: unknown };

export type ApiState<T> = {
  loading: boolean;
  error: unknown;
  data: T | null;
  retry: () => void;
};

/**
 * Loads data in the browser. `key` names the request (for example the address
 * with its parameters): a new key loads again, `retry` loads again with the
 * same key, and an answer for an older key or attempt is ignored.
 */
export function useApi<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  key: string,
): ApiState<T> {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled<T> | null>(null);
  const fetcherRef = useRef(fetcher);
  const id = `${key}#${attempt}`;

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    const controller = new AbortController();
    let stale = false;
    fetcherRef
      .current(controller.signal)
      .then(
        (data) => ({ id, data, error: null }),
        (error: unknown) => ({ id, data: null, error }),
      )
      .then((result) => {
        if (!stale) setSettled(result);
      });
    return () => {
      stale = true;
      controller.abort();
    };
  }, [id]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const current = settled?.id === id ? settled : null;
  return {
    loading: current === null,
    error: current ? current.error : null,
    data: current ? current.data : null,
    retry,
  };
}
