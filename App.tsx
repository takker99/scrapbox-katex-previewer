/** @jsx h */
/** @jsxFrag Fragment */
import { Fragment, h, render, useEffect, useState } from "./deps/preact.tsx";
import { useKaTeX } from "./useKaTeX.ts";
import type { KatexOptions } from "./deps/katex.ts";
import { version } from "./deps/katex.ts";
import { PopupContainer, style as popupStyle } from "./PopupContainer.tsx";
import { useCaretPosition } from "./useCaretPosition.ts";
import {
  cursor as cursorDOM,
  editor,
  getCharDOM,
} from "./deps/scrapbox-std.ts";

const App = (props: KatexOptions) => {
  const { ref, error, setFormula } = useKaTeX("", props); // 数式rendering用hook
  const [open, setOpen] = useState(false); // popupの開閉
  const [cursor, setCursor] = useState({
    top: 0,
    left: 0,
  }); // cursorの位置
  const { line, char } = useCaretPosition();

  // .formula内にcursorが来たらpreviewを開始する
  useEffect(() => {
    const charDOM = getCharDOM(line, char);
    if (!charDOM) {
      setOpen(false);
      return;
    }
    // TODO: wanna replace `getFormulaDOM()`
    const formulaDOM = charDOM.closest(".cursor-line span.formula");
    if (!formulaDOM) {
      setOpen(false);
      return;
    }
    setOpen(true);
    setFormula((formulaDOM.textContent ?? "").slice(3, -1));

    // popupを出すy座標は、[$ ]の上端に合わせる
    const { top: formulaTop } = formulaDOM.getBoundingClientRect();
    const { top, left } = editor()?.getBoundingClientRect?.() ??
      { top: 0, left: 0 };
    const cursorLeft = cursorDOM()?.getBoundingClientRect?.()?.left ?? 0;
    setCursor({
      top: formulaTop - top,
      left: cursorLeft - left,
    });
  }, [line, char]);

  return (
    <>
      <link
        rel="stylesheet"
        href={`https://cdnjs.cloudflare.com/ajax/libs/KaTeX/${version}/katex.min.css`}
      />

      <style>
        {`.error {
  color:#fd7373;
}
.katex-display {
  display: inline-block !important;
  margin: 0 !important;
  text-align: inherit !important;
  color: #eee;
}
${popupStyle}`}
      </style>
      <PopupContainer top={cursor.top} left={cursor.left} open={open}>
        {error && <span class="error">{error}</span>}
        <span class="katex-display" ref={ref} />
      </PopupContainer>
    </>
  );
};

export type MountOptions = {
  throwOnError?: boolean;
};
export const mount = (options?: MountOptions): void => {
  const { throwOnError = false } = options ?? {};

  const app = document.createElement("div");
  app.dataset.userscriptName = "katex-previewer";
  editor()!.append(app);
  const shadowRoot = app.attachShadow({ mode: "open" });

  render(<App throwOnError={throwOnError} />, shadowRoot);
};
