import { useEffect, useRef } from "react";

export function useRealtimeRefresh(events: string[], load: () => void) {
  const loadRef = useRef(load);
  loadRef.current = load;
  const key = events.join(",");

  useEffect(() => {
    const handler = () => loadRef.current();
    const names = new Set(["pageRefresh", ...events]);
    names.forEach((name) => window.addEventListener(name, handler));
    return () => names.forEach((name) => window.removeEventListener(name, handler));
  }, [key]);
}
