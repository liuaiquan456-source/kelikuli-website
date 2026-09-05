"use client";
import { useEffect, useRef, useState } from "react";

// Inline image inside a news article body. Many older articles reference
// /images/uploads/* files that were lost in a host migration and can't be
// recovered from the image cache (they were never optimized). Hide a broken
// one instead of showing the browser's broken-image glyph + alt text.
export default function ArticleImage({ src, alt }: { src: string; alt: string }) {
  const [broken, setBroken] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // Catch a load failure that already happened before hydration attached onError.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setBroken(true);
  }, []);

  if (broken || !src) return null;
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      ref={ref}
      src={src}
      alt={alt}
      loading="lazy"
      className="max-w-full rounded-xl my-4 mx-auto block"
      onError={() => setBroken(true)}
    />
  );
}
