"use client";
import { useState } from "react";

// Inline image inside a news article body. Many older articles reference
// /images/uploads/* files that were lost in a host migration and can't be
// recovered from the image cache (they were never optimized). Hide a broken
// one instead of showing the browser's broken-image glyph + alt text.
export default function ArticleImage({ src, alt }: { src: string; alt: string }) {
  const [broken, setBroken] = useState(false);
  if (broken || !src) return null;
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="max-w-full rounded-xl my-4 mx-auto block"
      onError={() => setBroken(true)}
    />
  );
}
