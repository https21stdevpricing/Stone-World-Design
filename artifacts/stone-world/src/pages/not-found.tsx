import { useState, useCallback, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Home, ArrowRight } from "lucide-react";

const COLS = 9;
const ROWS = 4;

const CRACK_PATH =
  "M 195 0 L 182 28 L 198 52 L 178 80 L 196 108 L 175 136 L 192 160";

function brickShade(row: number, col: number): string {
  const v = (row * 13 + col * 7 + row * col) % 6;
  return ["#111113", "#161618", "#131315", "#1A1A1C", "#111113", "#181819"][v];
}

function CrackPath({ animate: run }: { animate: boolean }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 390 160"
      preserveAspectRatio="none"
    >
      <motion.path
        d={CRACK_PATH}
        stroke="#00B4B4"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={run ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        transition={{ duration: 0.75, delay: 0.55, ease: [0.2, 0.8, 0.4, 1] }}
      />
      <motion.path
        d="M 182 52 L 168 62 L 174 75"
        stroke="#00B4B4"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
        strokeOpacity="0.6"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={run ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        transition={{ duration: 0.4, delay: 0.95, ease: "easeOut" }}
      />
      <motion.path
        d="M 196 108 L 212 118 L 208 132"
        stroke="#00B4B4"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
        strokeOpacity="0.6"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={run ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        transition={{ duration: 0.35, delay: 1.1, ease: "easeOut" }}
      />
    </svg>
  );
}

type DustParticle = { id: string; x: number; delay: number };

export default function NotFound() {
  const [fallen, setFallen] = useState<Set<string>>(new Set());
  const [dust, setDust] = useState<DustParticle[]>([]);
  const [crackVisible, setCrackVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setCrackVisible(true), 300);
    const initialFalls = ["1-3", "1-4", "1-5", "2-3", "2-4", "2-5", "2-6"];
    initialFalls.forEach((id, i) => {
      setTimeout(() => {
        setFallen((prev) => new Set([...prev, id]));
        const col = parseInt(id.split("-")[1]);
        const particle: DustParticle = {
          id: `init-${id}-${i}`,
          x: (col / COLS) * 100,
          delay: 0,
        };
        setDust((prev) => [...prev, particle]);
      }, 900 + i * 70);
    });
    return () => clearTimeout(t1);
  }, []);

  const handleBrick = useCallback(
    (id: string) => {
      if (fallen.has(id)) return;
      setFallen((prev) => new Set([...prev, id]));
      const col = parseInt(id.split("-")[1]);
      setDust((prev) => [
        ...prev,
        { id: `click-${id}-${Date.now()}`, x: (col / COLS) * 100, delay: 0 },
      ]);
    },
    [fallen]
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 select-none">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl flex flex-col items-center"
      >
        {/* Hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="mb-3 text-[10px] font-bold tracking-[0.28em] uppercase text-gray-300"
        >
          tap the bricks
        </motion.p>

        {/* Brick wall */}
        <div className="relative w-full">
          <div
            className="grid gap-[3px]"
            style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
          >
            {Array.from({ length: ROWS }, (_, row) =>
              Array.from({ length: COLS }, (_, col) => {
                const id = `${row}-${col}`;
                const isFallen = fallen.has(id);
                const staggerDelay = (row * COLS + col) * 0.012;
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: -18 }}
                    animate={
                      isFallen
                        ? {
                            opacity: 0,
                            y: 56,
                            rotate: col % 2 === 0 ? -18 : 14,
                            scale: 0.85,
                          }
                        : { opacity: 1, y: 0 }
                    }
                    transition={
                      isFallen
                        ? { duration: 0.5, ease: [0.4, 0, 1, 1] }
                        : {
                            duration: 0.38,
                            delay: staggerDelay,
                            type: "spring",
                            stiffness: 300,
                            damping: 26,
                          }
                    }
                    onClick={() => handleBrick(id)}
                    whileHover={!isFallen ? { scale: 1.05, filter: "brightness(1.5)" } : {}}
                    whileTap={!isFallen ? { scale: 0.95 } : {}}
                    className="h-9 sm:h-11 rounded-[3px] cursor-pointer"
                    style={{ background: brickShade(row, col) }}
                  />
                );
              })
            )}
          </div>

          <CrackPath animate={crackVisible} />

          {/* Dust particles */}
          <AnimatePresence>
            {dust.map((p) => (
              <motion.div
                key={p.id}
                className="absolute pointer-events-none"
                style={{ left: `${p.x}%`, bottom: 0 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                onAnimationComplete={() => {
                  setDust((prev) => prev.filter((d) => d.id !== p.id));
                }}
              >
                {[...Array(5)].map((_, i) => (
                  <motion.span
                    key={i}
                    className="absolute block w-1 h-1 rounded-full bg-gray-400"
                    style={{ left: `${(i - 2) * 6}px`, bottom: 0 }}
                    initial={{ opacity: 0.7, y: 0, x: 0 }}
                    animate={{
                      opacity: 0,
                      y: -(12 + i * 6),
                      x: (i - 2) * 5,
                    }}
                    transition={{ duration: 0.7, ease: "easeOut", delay: p.delay + i * 0.04 }}
                  />
                ))}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* 404 */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-7 font-black leading-none tracking-tighter text-gray-950"
          style={{ fontSize: "clamp(5rem, 18vw, 9rem)" }}
        >
          404
        </motion.p>

        {/* Copy */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          className="text-center mt-3 space-y-1.5"
        >
          <h1 className="text-lg sm:text-xl font-black tracking-tight text-gray-950">
            Even the finest marble cracks sometimes.
          </h1>
          <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
            This page doesn't exist — but 500+ premium materials do.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.92 }}
          className="flex flex-col sm:flex-row gap-3 mt-8"
        >
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-gray-950 text-white font-semibold text-sm hover:bg-gray-800 transition-colors"
          >
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <Link
            href="/discover"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            Browse Materials <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Teal accent */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="mt-10 h-0.5 w-12 bg-teal-500 rounded-full"
        />
      </motion.div>
    </div>
  );
}
