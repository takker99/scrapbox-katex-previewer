/** @jsx h */
/** @jsxFrag Fragment */
import { Fragment, h, render, useEffect, useState } from "./deps/preact.tsx";
import { useKaTeX } from "./useKaTeX.ts";
import { version } from "./deps/katex.ts";
import { PopupContainer, style as popupStyle } from "./PopupContainer.tsx";
import { useCursorObserver } from "./useCursorObserver.ts";

const App = () => {
  const { ref, error, setFormula } = useKaTeX(""); // 数式rendering用hook
  const [open, setOpen] = useState(false); // popupの開閉
  const [cursor, setCursor] = useState({
    top: 0,
    left: 0,
  }); // cursorの位置
  const positions = useCursorObserver();

  // .formula内にcursorが来たらpreviewを開始する
  useEffect(() => {
    if (!positions) return;
    const {
      elements,
      cursor: { left },
      editor,
    } = positions;
    const formulaDOM = elements.find((element) =>
      element.tagName === "CODE" &&
      element.nextElementSibling?.classList?.contains("preview")
    );
    if (!formulaDOM) {
      setOpen(false);
      return;
    }
    setOpen(true);
    setFormula((formulaDOM.textContent ?? "").slice(3, -1));

    // popupを出すy座標は、[$ ]の上端に合わせる
    const { top: formulaTop } = formulaDOM.getBoundingClientRect();
    setCursor({
      top: formulaTop - editor.top,
      left: left - editor.left,
    });
  }, [positions]);

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
        ${error && <span class="error">{error}</span>}
        <span class="katex-display" ref={ref} />
      </PopupContainer>
    </>
  );
};

const app = document.createElement("div");
app.dataset.userscriptName = "katex-previewer";
document.getElementById("editor")!.append(app);
const shadowRoot = app.attachShadow({ mode: "open" });
render(<App />, shadowRoot);
