import { usePromiseSettledAnytimes } from "./usePromiseSettledAnytimes.ts";
import { useEffect } from "./deps/preact.tsx";

export const useMutationObserver = <E extends HTMLElement>(
  element: E,
  options?: MutationObserverInit,
) => {
  const [waitChanged, callback] = usePromiseSettledAnytimes<MutationRecord[]>();
  useEffect(() => {
    const mutationObserver = new MutationObserver(callback);
    mutationObserver.observe(element, options);

    return () => mutationObserver.disconnect();
  }, [element, options]);

  return waitChanged;
};
