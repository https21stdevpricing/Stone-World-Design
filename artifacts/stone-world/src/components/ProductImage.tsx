import { useState, useEffect } from "react";

interface ProductImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

export function ProductImage({ src, alt, className, fallbackClassName }: ProductImageProps) {
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
  }, [src]);

  if (src && !errored) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onError={() => setErrored(true)}
      />
    );
  }

  return (
    <div className={`bg-gradient-to-br from-teal-400 to-slate-800 flex items-center justify-center ${fallbackClassName ?? "w-full h-full"}`}>
      <span className="text-white/20 font-black tracking-tight select-none" style={{ fontSize: "clamp(1.5rem, 5vw, 3rem)" }}>SW</span>
    </div>
  );
}
