import { useEffect, useState } from "./deps/preact.tsx";
import { useMutationObserver } from "./useMutationObserver.ts";
import { cursor } from "./dom.ts";

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
  const [positions, setPositions] = useState<
    { cursor: Rect; editor: DOMRect; elements: Element[] }
  >();

  useEffect(() => {
    (async () => {
      while (true) {
        const [mutation] = await listenMutations();

        const cursor = mutation.target as HTMLDivElement;
        const top = parseInt(cursor.style.top);
        const left = parseInt(cursor.style.left);
        const height = parseInt(cursor.style.height);
        const editorRect = cursor.parentElement!.getBoundingClientRect();
        const cursorRect = {
          top: top + editorRect.top,
          left: left + editorRect.left,
          right: left + 1 + editorRect.left,
          bottom: top + height + editorRect.top,
          height,
          width: 1,
        };
        const elements = document.elementsFromPoint(
          cursorRect.left + cursorRect.width / 2,
          cursorRect.top + cursorRect.height / 2,
        );
        setPositions(() => ({
          cursor: cursorRect,
          editor: editorRect,
          elements,
        }));
      }
    })();
  }, []);

  return positions;
}
