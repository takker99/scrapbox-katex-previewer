/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="dom" />
import { useEffect, useRef, useState } from "./deps/preact.tsx";
import { importKaTeX, KatexOptions } from "./deps/katex.ts";

export interface ParseError {
  name: string;
  message: string;
  position: number;
}

export function useKaTeX(_formula: string, options: KatexOptions = {}) {
  const ref = useRef<HTMLElement>(null);
  const [formula, setFormula] = useState(_formula);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { render } = await importKaTeX();
      if (!ref.current) return;
      try {
        render(formula, ref.current, options);
        setError("");
      } catch (e) {
        if (e instanceof Error && e.name === "ParseError") {
          setError(e.message);
        } else {
          throw e;
        }
      }
    })();
  }, [formula]);

  return { ref, error, setFormula };
}
