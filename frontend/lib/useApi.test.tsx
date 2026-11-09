import { act, renderHook, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { useApi } from "./useApi";

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

it("starts loading and then gives the data", async () => {
  const d = deferred<string>();
  const { result } = renderHook(() => useApi(() => d.promise, "k"));

  expect(result.current).toMatchObject({
    loading: true,
    error: null,
    data: null,
  });

  await act(async () => d.resolve("hello"));

  expect(result.current).toMatchObject({
    loading: false,
    error: null,
    data: "hello",
  });
});

it("gives the error when the request fails", async () => {
  const failure = new Error("nope");
  const { result } = renderHook(() =>
    useApi(() => Promise.reject(failure), "k"),
  );

  await waitFor(() => expect(result.current.loading).toBe(false));

  expect(result.current.error).toBe(failure);
  expect(result.current.data).toBeNull();
});

it("retry loads again after an error", async () => {
  const fetcher = vi
    .fn<() => Promise<string>>()
    .mockRejectedValueOnce(new Error("down"))
    .mockResolvedValueOnce("back");
  const { result } = renderHook(() => useApi(fetcher, "k"));
  await waitFor(() => expect(result.current.error).not.toBeNull());

  act(() => result.current.retry());
  expect(result.current).toMatchObject({ loading: true, error: null });

  await waitFor(() => expect(result.current.data).toBe("back"));
  expect(result.current.error).toBeNull();
  expect(fetcher).toHaveBeenCalledTimes(2);
});

it("loads again when the key changes and ignores the stale answer", async () => {
  const first = deferred<string>();
  const second = deferred<string>();
  const { result, rerender } = renderHook(
    ({ k }) => useApi(() => (k === "a" ? first.promise : second.promise), k),
    { initialProps: { k: "a" } },
  );

  rerender({ k: "b" });
  await act(async () => second.resolve("B"));
  await act(async () => first.resolve("A"));

  expect(result.current).toMatchObject({ loading: false, data: "B" });
});

it("ignores an answer that arrives after unmount without error", async () => {
  const d = deferred<string>();
  const { unmount } = renderHook(() => useApi(() => d.promise, "k"));

  unmount();
  await act(async () => d.resolve("late"));
});
