import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";

interface ImageLightboxProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
}

export function ImageLightbox({ images, initialIndex, onClose, onIndexChange }: ImageLightboxProps) {
  const [current, setCurrent] = useState(initialIndex);
  const [direction, setDirection] = useState(0);
  const [scale, setScale] = useState(1);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  const lastTouchDist = useRef<number | null>(null);
  const lastTouchCenter = useRef<{ x: number; y: number } | null>(null);

  const go = useCallback(
    (delta: number) => {
      if (images.length <= 1) return;
      setDirection(delta);
      setScale(1);
      setOrigin({ x: 50, y: 50 });
      setCurrent(prev => {
        const next = (prev + delta + images.length) % images.length;
        onIndexChange?.(next);
        return next;
      });
    },
    [images.length, onIndexChange]
  );

  const jumpTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 1 : -1);
      setScale(1);
      setOrigin({ x: 50, y: 50 });
      setCurrent(index);
      onIndexChange?.(index);
    },
    [current, onIndexChange]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [go, onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const getTouchDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchCenter = (touches: React.TouchList) => ({
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      lastTouchDist.current = getTouchDistance(e.touches);
      lastTouchCenter.current = getTouchCenter(e.touches);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDist.current !== null) {
      const newDist = getTouchDistance(e.touches);
      const ratio = newDist / lastTouchDist.current;
      const newCenter = getTouchCenter(e.touches);

      setScale(prev => {
        const next = Math.min(Math.max(prev * ratio, 1), 5);
        return next;
      });

      if (lastTouchCenter.current) {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setOrigin({
          x: ((newCenter.x - rect.left) / rect.width) * 100,
          y: ((newCenter.y - rect.top) / rect.height) * 100,
        });
      }

      lastTouchDist.current = newDist;
      lastTouchCenter.current = newCenter;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      lastTouchDist.current = null;
      lastTouchCenter.current = null;
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (scale > 1) {
      setScale(1);
      setOrigin({ x: 50, y: 50 });
    } else {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setOrigin({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
      setScale(2.5);
    }
  };

  const imageVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  return (
    <motion.div
      key="lightbox-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        aria-label="Close lightbox"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {/* Image counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
          {current + 1} / {images.length}
        </div>
      )}

      {/* Zoom hint */}
      {scale === 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 bg-white/10 text-white/60 text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none select-none">
          <ZoomIn className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Double-click to zoom</span>
          <span className="sm:hidden">Pinch to zoom</span>
        </div>
      )}

      {/* Prev button */}
      {images.length > 1 && (
        <button
          onClick={() => go(-1)}
          className="absolute left-3 sm:left-6 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </button>
      )}

      {/* Next button */}
      {images.length > 1 && (
        <button
          onClick={() => go(1)}
          className="absolute right-3 sm:right-6 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          aria-label="Next image"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </button>
      )}

      {/* Image area */}
      <div
        className="w-full h-full flex items-center justify-center overflow-hidden px-16 sm:px-24 py-16"
        style={{ touchAction: "none" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence custom={direction} mode="popLayout">
          <motion.div
            key={current}
            custom={direction}
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full h-full flex items-center justify-center"
          >
            <div
              className="relative max-w-full max-h-full cursor-zoom-in select-none"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: `${origin.x}% ${origin.y}%`,
                transition: scale === 1 ? "transform 0.3s ease" : "none",
              }}
              onDoubleClick={handleDoubleClick}
            >
              <ProductImage
                src={images[current]}
                alt={`Image ${current + 1}`}
                className="max-w-[calc(100vw-8rem)] max-h-[calc(100vh-8rem)] sm:max-w-[calc(100vw-12rem)] sm:max-h-[calc(100vh-8rem)] object-contain rounded-lg"
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-12 sm:bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 max-w-xs sm:max-w-sm overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => jumpTo(i)}
              className={`shrink-0 w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                i === current ? "border-white opacity-100" : "border-transparent opacity-40 hover:opacity-70"
              }`}
              aria-label={`Go to image ${i + 1}`}
            >
              <ProductImage src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
