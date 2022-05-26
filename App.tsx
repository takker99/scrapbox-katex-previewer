/** @jsx h */
/** @jsxFrag Fragment */
import { Fragment, h, render, useEffect, useState } from "./deps/preact.tsx";
import { useKaTeX } from "./useKaTeX.ts";
import type { KatexOptions } from "./deps/katex.ts";
import { version } from "./deps/katex.ts";
import { PopupContainer, style as popupStyle } from "./PopupContainer.tsx";
import { useCaretPosition } from "./useCaretPosition.ts";
import { useLayout } from "./useLayout.ts";
import {
  cursor as cursorDOM,
  editor,
  getCharDOM,
} from "./deps/scrapbox-std.ts";

/** katex-previewerの有効/無効を切り替える函数を受け取るcallback
 *
 * @param enable previewerを有効にする
 * @param disable previewerを無効にする
 * @return (もし返すなら)useEffectに渡す後始末函数
 */
export type Controller = (
  enable: () => void,
  disable: () => void,
) => (void | (() => void));

/** `mount`に渡す初期化options*/
export interface MountOptions {
  /** 文法エラー箇所などの詳細なエラー内容を表示したいときは`true`を渡す
   *
   * @default false
   */
  throwOnError?: boolean;

  /** katex-previewerの有効/無効を切り替える函数を受け取るcallback */
  controller?: Controller;
}

/** katex-previewerを初期化する
 *
 * @param options 初期化options
 */
export const mount = (options?: MountOptions): void => {
  const { throwOnError = false, controller = () => {} } = options ?? {};

  const app = document.createElement("div");
  app.dataset.userscriptName = "katex-previewer";
  editor()!.append(app);
  const shadowRoot = app.attachShadow({ mode: "open" });

  render(
    <App throwOnError={throwOnError} controller={controller} />,
    shadowRoot,
  );
};

interface Props extends KatexOptions {
  controller: Controller;
}
const App = (props: Props) => {
  const { ref, error, setFormula } = useKaTeX("", props); // 数式rendering用hook
  const [open, setOpen] = useState(false); // popupの開閉
  const [enable, setEnable] = useState(true); // 有効無効切り替え
  const [cursor, setCursor] = useState({
    top: 0,
    left: 0,
  }); // cursorの位置
  const { line, char } = useCaretPosition();
  const layout = useLayout();

  // .formula内にcursorが来たらpreviewを開始する
  useEffect(() => {
    // 無効のときは何もしない
    if (!enable) return;

    // 編集画面以外では起動しない
    if (layout !== "page") {
      setOpen(false);
      return;
    }

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
  }, [line, char, layout, enable]);

  useEffect(
    () => props.controller(() => setEnable(true), () => setEnable(false)),
    [
      props.controller,
    ],
  );

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
