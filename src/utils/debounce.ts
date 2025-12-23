/**
 * Debounce utility for rate-limiting function calls.
 *
 * @module utils/debounce
 */

/**
 * A debounced function with cancel and flush methods.
 */
export interface DebouncedFunction<T extends (...args: never[]) => void> {
  /** Call the debounced function */
  (...args: Parameters<T>): void;

  /** Cancel any pending invocation */
  cancel(): void;

  /** Immediately execute any pending invocation */
  flush(): void;
}

/**
 * Creates a debounced version of the provided function.
 *
 * The debounced function delays invoking the function until after
 * `delay` milliseconds have elapsed since the last time it was invoked.
 *
 * @param fn - The function to debounce
 * @param delay - The number of milliseconds to delay
 * @returns A debounced version of the function
 *
 * @example
 * ```typescript
 * const debouncedSave = debounce(save, 300);
 * debouncedSave(); // Will be called after 300ms of inactivity
 * ```
 */
export function debounce<T extends (...args: never[]) => void>(
  fn: T,
  delay: number
): DebouncedFunction<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let pendingArgs: Parameters<T> | null = null;

  const cancel = (): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    pendingArgs = null;
  };

  const flush = (): void => {
    if (timeoutId !== null && pendingArgs !== null) {
      const args = pendingArgs;
      clearTimeout(timeoutId);
      timeoutId = null;
      pendingArgs = null;
      fn(...args);
    }
  };

  const debounced = (...args: Parameters<T>): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    pendingArgs = args;
    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (pendingArgs !== null) {
        const finalArgs = pendingArgs;
        pendingArgs = null;
        fn(...finalArgs);
      }
    }, delay);
  };

  debounced.cancel = cancel;
  debounced.flush = flush;

  return debounced;
}
