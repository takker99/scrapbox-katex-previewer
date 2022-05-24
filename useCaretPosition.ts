import { useEffect, useState } from "./deps/preact.tsx";
import { Position, takeCursor } from "./deps/scrapbox-std.ts";

export const useCaretPosition = (): Position => {
  const [position, setPosition] = useState<Position>({ line: 0, char: 0 });

  useEffect(() => {
    const cursor = takeCursor();
    const update = () => setPosition(cursor.getPosition());
    cursor.addChangeListener(update);
    return () => cursor.removeChangeListener(update);
  }, []);

  return position;
};
