import { useEffect, useState } from "./deps/preact.tsx";
import { useMutationObserver } from "./useMutationObserver.ts";
import { caret, cursor, Position } from "./deps/scrapbox-std.ts";

export interface Rect {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
}
export function useCursorObserver() {
  const listenMutations = useMutationObserver(cursor()!, {
    attributes: true,
    attributeFilter: ["style"],
  });
  const [position, setPosition] = useState<Position>({ line: 0, char: 0 });

  useEffect(() => {
    (async () => {
      while (true) {
        await listenMutations();
        setPosition(caret().position);
      }
    })();
  }, []);

  return position;
}
