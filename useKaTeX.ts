/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="dom" />
import { useEffect, useRef, useState } from "./deps/preact.tsx";
import { importKaTeX, katex } from "./deps/katex.ts";

export interface ParseError {
  name: string;
  message: string;
  position: number;
}

export function useKaTeX(_formula: string) {
  const ref = useRef<HTMLElement>(null);
  const [formula, setFormula] = useState(_formula);
  const [error, setError] = useState<ParseError | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const { render } = await importKaTeX();
      if (!ref.current) return;
      try {
        render(formula, ref.current);
        setError(undefined);
      } catch (e) {
        if (e instanceof katex.ParseError) {
          setError(e);
          return;
        }
        throw e;
      }
    })();
  }, [formula]);

  return { ref, error, setFormula };
}
