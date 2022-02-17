/** @jsx h */
/** @jsxFrag Fragment */
import { ComponentChildren, h, toChildArray, useMemo } from "./deps/preact.tsx";
import useResizeObserver from "./deps/use-resize-observer.ts";
import { editor } from "./deps/scrapbox-std.ts";

type Props = {
  open: boolean;
  children: ComponentChildren;
} & CursorPosition;
type CursorPosition = {
  top: number;
  left: number;
};

export function PopupContainer({ top, left, open, children }: Props) {
  const cursorPosition = useMemo(
    () => ({ top, left }),
    [top, left],
  );

  const { ref, width: buttonContainerWidth = 0 } = useResizeObserver();
  const { width: editorWidth = 0 } = useResizeObserver({
    ref: editor(),
  });
  const isEmpty = useMemo(() => toChildArray(children).length === 0, [
    children,
  ]);

  const triangleStyle = calcTriangleStyle(cursorPosition, isEmpty);
  const buttonContainerStyle = calcButtonContainerStyle(
    editorWidth,
    buttonContainerWidth,
    cursorPosition,
    isEmpty,
  );

  return (
    <div class="popup-menu" style={{ top: cursorPosition.top }} hidden={!open}>
      <div ref={ref} class="button-container" style={buttonContainerStyle}>
        {children}
      </div>
      <div class="triangle" style={triangleStyle} />
    </div>
  );
}

export const style = `
.popup-menu {
  position:absolute;
  left:0;
  width:100%;
  z-index:300;
  transform:translateY(calc(-100% - 14px));
  -webkit-user-select:none;
  user-select:none;
  font-family:"Open Sans",Helvetica,Arial,"Hiragino Sans",sans-serif;
  pointer-events:none
}
.popup-menu .button-container {
  position:relative;
  display:inline-block;
  max-width:70vw;
  min-width:80px;
  text-align:center;
  background-color:#111;
  padding:0 1px;
  border-radius:4px;
  pointer-events:auto
}
html[data-os*='android'] .popup-menu .button-container,
.popup-menu .button-container[data-os*='android'] {
  max-width:90vw
}
html[data-os*='ios'] .popup-menu .button-container,
.popup-menu .button-container[data-os*='ios'] {
  max-width:90vw
}
.popup-menu .triangle {
  position:absolute;
  transform:translateX(-50%);
  width:0;
  height:0;
  border-top:6px solid #111;
  border-left:8px solid transparent;
  border-right:8px solid transparent
}
html[data-os*='android'] .popup-menu.vertical .button-container,
.popup-menu[data-os*='android'].vertical .button-container {
  max-width:80vw;
  text-align:left
}
`;

/** .triangle のスタイルを計算する */
const calcTriangleStyle = (
  cursorPosition: CursorPosition,
  isEmpty: boolean,
) => ({
  left: cursorPosition.left,
  ...(isEmpty
    ? {
      borderTopColor: "#555",
    }
    : {}),
});

/** .button-container のスタイルを計算する */
function calcButtonContainerStyle(
  editorWidth: number,
  buttonContainerWidth: number,
  cursorPosition: CursorPosition,
  isEmpty: boolean,
) {
  const translateX = (cursorPosition.left / editorWidth) * 100;
  // 端に寄り過ぎないように、translateX の上限・下限を設定しておく。
  // 値はフィーリングで決めており、何かに裏打ちされたものではないので、変えたかったら適当に変える。
  const minTranslateX = (20 / buttonContainerWidth) * 100;
  const maxTranslateX = 100 - minTranslateX;

  return {
    left: cursorPosition.left,
    transform: `translateX(-${
      Math.max(minTranslateX, Math.min(translateX, maxTranslateX))
    }%)`,
    ...(isEmpty
      ? {
        color: "#eee",
        fontSize: "11px",
        display: "inline-block",
        padding: "0 5px",
        cursor: "not-allowed",
        backgroundColor: "#555",
      }
      : {}),
  };
}
