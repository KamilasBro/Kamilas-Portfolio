import { useState, useEffect } from "react";
import { RefObject } from "react";

export default function useImagesLoaded(containerRef: RefObject<HTMLDivElement>) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const images = Array.from(container.querySelectorAll("img"));

    Promise.all(images.map(img => img.decode().catch(() => { })))
      .then(() => setLoaded(true));

  }, [containerRef]);

  return loaded;
}