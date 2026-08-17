"use client";
import { useState } from "react";
import Image from "next/image";

export default function ProductImage({
  src,
  alt,
  sizes,
  className,
  priority,
}: {
  src?: string | null;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-stone-50 text-stone-300 text-xs">
        No image
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      onError={() => setError(true)}
      priority={priority}
    />
  );
}
