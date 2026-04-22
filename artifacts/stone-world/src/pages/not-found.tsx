import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Home } from "lucide-react";

function BrokenBrickIllustration() {
  const bricks = [
    { x: 0, y: 0, w: 80, h: 30, delay: 0, fall: 0 },
    { x: 88, y: 0, w: 100, h: 30, delay: 0.06, fall: 0 },
    { x: 196, y: 0, w: 80, h: 30, delay: 0.12, fall: 0 },
    { x: 0, y: 38, w: 60, h: 30, delay: 0.18, fall: 0 },
    { x: 68, y: 38, w: 96, h: 30, delay: 0.24, fall: 0 },
    { x: 172, y: 38, w: 104, h: 30, delay: 0.3, fall: 0 },
    { x: 0, y: 76, w: 90, h: 30, delay: 0.36, fall: 0 },
    { x: 98, y: 76, w: 80, h: 30, delay: 0.42, fall: 0 },
    { x: 186, y: 76, w: 90, h: 30, delay: 0.48, fall: 0 },
    // cracked/falling center bricks
    { x: 80, y: 110, w: 60, h: 30, delay: 0.1, fall: 120 },
    { x: 148, y: 110, w: 90, h: 30, delay: 0.05, fall: 160 },
    { x: 30, y: 110, w: 40, h: 30, delay: 0.18, fall: 80 },
    { x: 250, y: 110, w: 50, h: 30, delay: 0.22, fall: 100 },
    { x: 0, y: 110, w: 20, h: 30, delay: 0.3, fall: 60 },
  ];

  return (
    <svg
      viewBox="0 0 276 220"
      width="276"
      height="220"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Solid upper bricks */}
      {bricks.slice(0, 9).map((b, i) => (
        <motion.g
          key={i}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: b.delay, type: "spring", stiffness: 200 }}
        >
          <rect
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            rx="3"
            fill={i % 2 === 0 ? "#1A1A1A" : "#2A2A2A"}
            stroke="#000"
            strokeWidth="1"
          />
          {/* Texture lines */}
          <line
            x1={b.x + 8}
            y1={b.y + 10}
            x2={b.x + b.w - 8}
            y2={b.y + 10}
            stroke="#333"
            strokeWidth="0.6"
          />
          <line
            x1={b.x + 8}
            y1={b.y + 20}
            x2={b.x + b.w - 8}
            y2={b.y + 20}
            stroke="#333"
            strokeWidth="0.6"
          />
        </motion.g>
      ))}

      {/* Middle row with teal accent */}
      {[
        { x: 0, y: 38, w: 60 },
        { x: 68, y: 38, w: 96 },
        { x: 172, y: 38, w: 104 },
      ].map((b, i) => (
        <motion.rect
          key={`accent-${i}`}
          x={b.x + 2}
          y={b.y + 13}
          width={b.w - 4}
          height={4}
          rx="1"
          fill="#00B4B4"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.6 + i * 0.15 }}
          style={{ transformOrigin: `${b.x + 2}px ${b.y + 15}px` }}
        />
      ))}

      {/* "404" cutout area — dark gap */}
      <motion.rect
        x={0}
        y={108}
        width={276}
        height={34}
        fill="white"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        style={{ originX: "138px", originY: "125px" }}
      />

      {/* Falling / cracked bricks at bottom */}
      {bricks.slice(9).map((b, i) => (
        <motion.g
          key={`fall-${i}`}
          initial={{ opacity: 1, y: 0, rotate: 0 }}
          animate={{
            opacity: [1, 1, 0],
            y: [0, b.fall * 0.3, b.fall],
            rotate: [(i % 2 === 0 ? -5 : 5), (i % 2 === 0 ? -15 : 12)],
          }}
          transition={{
            duration: 1.2,
            delay: 1 + b.delay,
            ease: "easeIn",
            repeat: Infinity,
            repeatDelay: 2.5,
          }}
          style={{ transformOrigin: `${b.x + b.w / 2}px ${b.y + b.h / 2}px` }}
        >
          <rect
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            rx="3"
            fill={i % 2 === 0 ? "#1A1A1A" : "#2A2A2A"}
            stroke="#000"
            strokeWidth="1"
          />
          {/* Crack SVG path */}
          <path
            d={`M ${b.x + b.w * 0.4} ${b.y} L ${b.x + b.w * 0.45} ${b.y + 12} L ${b.x + b.w * 0.38} ${b.y + 18} L ${b.x + b.w * 0.5} ${b.y + b.h}`}
            stroke="#00B4B4"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
          />
        </motion.g>
      ))}

      {/* Dust particles */}
      {[...Array(8)].map((_, i) => (
        <motion.circle
          key={`dust-${i}`}
          cx={60 + i * 25}
          cy={115}
          r={i % 2 === 0 ? 2 : 1.4}
          fill="#9CA3AF"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.8, 0],
            cy: [115, 115 + 20 + i * 5],
            cx: [60 + i * 25, 60 + i * 25 + (i % 2 === 0 ? 8 : -6)],
          }}
          transition={{
            duration: 1.4,
            delay: 1.2 + i * 0.08,
            repeat: Infinity,
            repeatDelay: 2.3,
            ease: "easeOut",
          }}
        />
      ))}
    </svg>
  );
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center text-center max-w-lg"
      >
        {/* Illustration */}
        <div className="mb-6">
          <BrokenBrickIllustration />
        </div>

        {/* 404 number */}
        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-[96px] sm:text-[120px] font-black leading-none tracking-tighter text-gray-950 select-none"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          404
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="space-y-3 mt-2"
        >
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-950">
            Even the finest marble cracks sometimes.
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
            This page went the way of the quarry — empty. But we have 500+ premium materials waiting for you that are very much real.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-3 mt-8"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gray-950 text-white font-semibold text-sm hover:bg-gray-800 transition-colors"
          >
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            Browse Materials <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Teal accent line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-12 h-0.5 w-16 bg-teal-500 rounded-full"
        />
      </motion.div>
    </div>
  );
}
