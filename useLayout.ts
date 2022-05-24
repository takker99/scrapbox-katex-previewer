import { useEffect, useState } from "./deps/preact.tsx";
import type { Layout, Scrapbox } from "./deps/scrapbox.ts";
declare const scrapbox: Scrapbox;

export const useLayout = (): Layout => {
  const [layout, setLayout] = useState<Layout>(scrapbox.Layout);

  useEffect(() => {
    const update = () => setLayout(scrapbox.Layout);
    scrapbox.addListener("layout:changed", update);
    return () => scrapbox.removeListener("layout:changed", update);
  }, []);

  return layout;
};
