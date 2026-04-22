import { useState } from "react";
import { Footer } from "@/components/Footer";
import {
  useTrackEnquiry,
  useTrackByPhone,
  getTrackEnquiryQueryKey,
  getTrackByPhoneQueryKey,
} from "@workspace/api-client-react";
import type { TrackedEnquiry, PhoneEnquirySummary } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, CheckCircle2, Clock, MessageSquare, FileText, XCircle,
  ArrowRight, Phone, Hash
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { Link } from "wouter";

const STATUS_CONFIG: Record<string, {
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  description: string;
}> = {
  new: {
    label: "Received",
    icon: <CheckCircle2 className="w-5 h-5" />,
    color: "text-blue-600",
    bg: "bg-blue-50",
    description: "Your enquiry has been received and is waiting to be reviewed by our team.",
  },
  in_discussion: {
    label: "In Discussion",
    icon: <MessageSquare className="w-5 h-5" />,
    color: "text-amber-600",
    bg: "bg-amber-50",
    description: "Our team is currently reviewing your enquiry and will be in touch with you shortly.",
  },
  quoted: {
    label: "Quoted",
    icon: <FileText className="w-5 h-5" />,
    color: "text-teal-600",
    bg: "bg-teal-50",
    description: "A quote has been prepared for your project. Our team will contact you with details.",
  },
  closed: {
    label: "Closed",
    icon: <XCircle className="w-5 h-5" />,
    color: "text-gray-500",
    bg: "bg-gray-50",
    description: "This enquiry has been closed. Please contact us if you need further assistance.",
  },
};

const JOURNEY_STEPS = [
  { key: "new", label: "Received" },
  { key: "in_discussion", label: "In Discussion" },
  { key: "quoted", label: "Quoted" },
  { key: "closed", label: "Closed" },
];

function getStepIndex(status: string) {
  return JOURNEY_STEPS.findIndex((s) => s.key === status);
}

function DottedSpinner({ size = 40 }: { size?: number }) {
  const dots = 8;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      {Array.from({ length: dots }).map((_, i) => {
        const angle = (i / dots) * 2 * Math.PI - Math.PI / 2;
        const x = 20 + 14 * Math.cos(angle);
        const y = 20 + 14 * Math.sin(angle);
        return (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r={2.2}
            fill="#00B4B4"
            initial={{ opacity: 0.15 }}
            animate={{ opacity: [0.15, 1, 0.15] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: (i / dots) * 1.2,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </svg>
  );
}

function TrackIllustration() {
  const STAGES = [
    { label: "Received",   done: true,  current: false },
    { label: "In Review",  done: true,  current: false },
    { label: "Quoted",     done: false, current: true  },
    { label: "Complete",   done: false, current: false },
  ];

  return (
    <svg width="310" height="210" viewBox="0 0 310 210" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Card background */}
      <motion.rect
        x="0" y="0" width="310" height="210" rx="20"
        fill="#F8FFFE" stroke="#00B4B4" strokeWidth="1" strokeOpacity="0.25"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      />

      {/* Top: ref number + badge */}
      <motion.text
        x="20" y="30" fontSize="7.5" fontWeight="800" fill="#9CA3AF"
        fontFamily="system-ui" letterSpacing="0.18em"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
      >ENQUIRY REFERENCE</motion.text>

      <motion.text
        x="20" y="55" fontSize="22" fontWeight="900" fill="#111827"
        fontFamily="system-ui" letterSpacing="-0.04em"
        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >SWA1B2C3</motion.text>

      {/* Status badge */}
      <motion.rect
        x="196" y="34" width="94" height="28" rx="10"
        fill="#00B4B4"
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, type: "spring" }}
      />
      {/* Pulsing dot in badge */}
      <motion.circle
        cx="209" cy="48" r="3" fill="white"
        animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.4, repeat: Infinity }}
      />
      <motion.text
        x="247" y="52" textAnchor="middle" fontSize="9" fontWeight="700" fill="white"
        fontFamily="system-ui"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
      >QUOTED</motion.text>

      {/* Divider */}
      <motion.line
        x1="20" y1="76" x2="290" y2="76"
        stroke="#E5E7EB" strokeWidth="1"
        initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: 1 }}
        style={{ transformOrigin: "20px 76px" }}
        transition={{ delay: 0.9, duration: 0.5 }}
      />

      {/* Stage journey */}
      {STAGES.map((stage, i) => {
        const x = 38 + i * 78;
        const cy = 130;
        return (
          <g key={stage.label}>
            {/* Connector line */}
            {i < 3 && (
              <>
                <line x1={x + 16} y1={cy} x2={x + 62} y2={cy} stroke="#E5E7EB" strokeWidth="2" />
                {(stage.done || stage.current) && (
                  <motion.line
                    x1={x + 16} y1={cy} x2={x + 62} y2={cy}
                    stroke="#00B4B4" strokeWidth="2"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ delay: 1.1 + i * 0.28, duration: 0.4 }}
                    strokeLinecap="round"
                  />
                )}
              </>
            )}

            {/* Outer pulse for current */}
            {stage.current && (
              <motion.circle cx={x} cy={cy} r={22} stroke="#00B4B4" strokeWidth="1.5" fill="none"
                animate={{ r: [16, 24, 16], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.2, repeat: Infinity }}
              />
            )}

            {/* Main node */}
            <motion.circle
              cx={x} cy={cy} r={16}
              fill={stage.done ? "#00B4B4" : stage.current ? "#F0FAFA" : "#F9FAFB"}
              stroke={stage.done || stage.current ? "#00B4B4" : "#D1D5DB"}
              strokeWidth="2"
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.9 + i * 0.2, type: "spring", stiffness: 300 }}
            />

            {/* Check for done */}
            {stage.done && (
              <motion.path
                d={`M${x - 6} ${cy} L${x - 2} ${cy + 4} L${x + 6} ${cy - 5}`}
                stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ delay: 1.0 + i * 0.2, duration: 0.3 }}
              />
            )}

            {/* Diamond for current */}
            {stage.current && (
              <motion.circle cx={x} cy={cy} r={5} fill="#00B4B4"
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 1.2 + i * 0.2, type: "spring" }}
              />
            )}

            {/* Label */}
            <motion.text
              x={x} y={cy + 28} textAnchor="middle"
              fontSize="8.5" fontWeight="700"
              fill={stage.done || stage.current ? "#00B4B4" : "#9CA3AF"}
              fontFamily="system-ui"
              initial={{ opacity: 0, y: cy + 34 }} animate={{ opacity: 1, y: cy + 28 }}
              transition={{ delay: 1.1 + i * 0.2 }}
            >{stage.label}</motion.text>
          </g>
        );
      })}

      {/* Bottom footer line */}
      <motion.text
        x="20" y="196" fontSize="7.5" fill="#9CA3AF" fontFamily="system-ui"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
      >Updated 2 hrs ago · AB Stone World</motion.text>

      <motion.text
        x="290" y="196" textAnchor="end" fontSize="7.5" fontWeight="700" fill="#00B4B4" fontFamily="system-ui"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
      >View Details →</motion.text>
    </svg>
  );
}

export default function Track() {
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const initialRef = searchParams.get("ref") ?? "";

  const [mode, setMode] = useState<"ref" | "phone">("ref");
  const [inputRef, setInputRef] = useState(initialRef);
  const [searchRef, setSearchRef] = useState(initialRef);
  const [inputPhone, setInputPhone] = useState("");
  const [searchPhone, setSearchPhone] = useState("");

  const refQuery = useTrackEnquiry(
    { ref: searchRef },
    { query: { queryKey: getTrackEnquiryQueryKey({ ref: searchRef }), enabled: !!searchRef, retry: false } }
  );
  const enquiry = refQuery.data;
  const refLoading = refQuery.isLoading;
  const refError = refQuery.isError;

  const phoneQuery = useTrackByPhone(
    { phone: searchPhone },
    { query: { queryKey: getTrackByPhoneQueryKey({ phone: searchPhone }), enabled: !!searchPhone, retry: false } }
  );
  const phoneResult: PhoneEnquirySummary | undefined = phoneQuery.data?.[0];
  const phoneLoading = phoneQuery.isLoading;
  const phoneError = phoneQuery.isError;

  const handleRefSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchRef(inputRef.trim().toUpperCase());
  };

  const handlePhoneSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchPhone(inputPhone.trim());
  };

  const handleSelectRef = (ref: string | null) => {
    if (!ref) return;
    setInputRef(ref);
    setSearchRef(ref);
    setMode("ref");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const switchMode = (newMode: "ref" | "phone") => {
    setMode(newMode);
    setSearchRef("");
    setSearchPhone("");
  };

  const statusConfig = enquiry ? (STATUS_CONFIG[enquiry.status] ?? STATUS_CONFIG["new"]) : null;
  const currentStepIndex = enquiry ? getStepIndex(enquiry.status) : -1;

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* Hero header */}
      <div className="pt-16 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-9 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              <p className="text-[10px] text-gray-400 tracking-[0.3em] font-semibold uppercase mb-1">Enquiry Status</p>
              <h1
                className="font-black tracking-tight text-gray-950 leading-[1.02]"
                style={{ fontSize: "clamp(2.2rem, 6vw, 4.5rem)" }}
              >
                Track Your<br />Enquiry.
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                Look up by reference number or the phone number you used when submitting.
              </p>
            </motion.div>

            {/* Animated illustration */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="hidden sm:block shrink-0"
            >
              <TrackIllustration />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Sticky breadcrumb bar */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-200 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center gap-2">
          <Search className="w-4 h-4 text-teal-500 shrink-0" strokeWidth={2.5} />
          <span className="text-sm font-semibold text-gray-700">Track Enquiry</span>
        </div>
      </div>

      <main className="flex-1 max-w-2xl mx-auto px-6 py-10 w-full">

        {/* Mode toggle */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-8 w-fit">
          <button
            onClick={() => switchMode("ref")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              mode === "ref"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            Reference No.
          </button>
          <button
            onClick={() => switchMode("phone")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              mode === "phone"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            Phone Number
          </button>
        </div>

        <AnimatePresence mode="wait" initial={false}>

          {/* ── REF MODE ── */}
          {mode === "ref" && (
            <motion.div
              key="ref-mode"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18 }}
            >
              <form onSubmit={handleRefSearch} className="flex gap-3 mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={inputRef}
                    onChange={(e) => setInputRef(e.target.value)}
                    placeholder="e.g. SWA1B2C3"
                    className="w-full text-lg font-bold tracking-widest uppercase text-gray-900 placeholder:text-gray-300 border-0 border-b-2 border-gray-200 focus:border-teal-500 outline-none pb-2.5 bg-transparent transition-colors duration-200"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!inputRef.trim()}
                  className="flex items-center gap-2 px-6 py-2 rounded-full bg-gray-950 text-white font-semibold text-sm hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  <Search className="w-4 h-4" /> Track
                </button>
              </form>

              <p className="text-xs text-gray-400 mb-10">
                Lost your reference?{" "}
                <button
                  onClick={() => switchMode("phone")}
                  className="text-teal-500 font-semibold hover:text-teal-700 transition-colors underline underline-offset-2"
                >
                  Look up by phone number instead
                </button>
              </p>

              {refLoading && searchRef && (
                <div className="flex items-center gap-4 py-8">
                  <DottedSpinner size={36} />
                  <span className="text-sm text-gray-400 font-medium">Looking up your enquiry...</span>
                </div>
              )}

              {refError && searchRef && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-red-100 bg-red-50 rounded-2xl p-6 space-y-2"
                >
                  <p className="font-bold text-red-600">Enquiry Not Found</p>
                  <p className="text-sm text-gray-500">
                    We couldn't find an enquiry with reference{" "}
                    <span className="font-mono font-semibold text-gray-800">{searchRef}</span>.{" "}
                    Please double-check the reference number from your confirmation, or{" "}
                    <button
                      onClick={() => switchMode("phone")}
                      className="text-teal-500 font-semibold hover:text-teal-700 transition-colors underline underline-offset-2"
                    >
                      look up by phone number
                    </button>.
                  </p>
                </motion.div>
              )}

              {enquiry && statusConfig && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig.bg} ${statusConfig.color} font-semibold text-sm`}>
                    {statusConfig.icon}
                    {statusConfig.label}
                  </div>

                  <div className="border border-gray-100 bg-gray-50/50 rounded-2xl p-6 space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] text-gray-400 tracking-[0.2em] uppercase font-semibold mb-1">Reference Number</p>
                        <p className="font-mono font-black text-xl tracking-widest text-teal-600">{enquiry.referenceNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-gray-400 tracking-[0.2em] uppercase font-semibold mb-1">Submitted</p>
                        <p className="font-semibold text-gray-800">{format(parseISO(enquiry.createdAt), "d MMM yyyy")}</p>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-[11px] text-gray-400 tracking-[0.2em] uppercase font-semibold mb-1">Customer</p>
                      <p className="font-semibold text-gray-800">{enquiry.name}</p>
                    </div>
                    {enquiry.productInterest && (
                      <div>
                        <p className="text-[11px] text-gray-400 tracking-[0.2em] uppercase font-semibold mb-1">Interest</p>
                        <p className="text-gray-600 text-sm">{enquiry.productInterest}</p>
                      </div>
                    )}
                  </div>

                  <div className={`p-5 rounded-2xl ${statusConfig.bg}`}>
                    <p className={`text-sm font-medium ${statusConfig.color} leading-relaxed`}>{statusConfig.description}</p>
                  </div>

                  <div>
                    <p className="text-[11px] text-gray-400 tracking-[0.2em] uppercase font-semibold mb-6">Journey</p>
                    <div className="relative flex items-start justify-between">
                      <div className="absolute top-4 left-4 right-4 h-px bg-gray-200" />
                      {JOURNEY_STEPS.map((step, index) => {
                        const isCompleted = index <= currentStepIndex;
                        const isCurrent = index === currentStepIndex;
                        return (
                          <div key={step.key} className="flex-1 flex flex-col items-center gap-2 relative z-10">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors text-xs font-bold ${
                                isCurrent
                                  ? "border-teal-500 bg-teal-500 text-white"
                                  : isCompleted
                                  ? "border-teal-500 bg-teal-50 text-teal-600"
                                  : "border-gray-200 bg-white text-gray-400"
                              }`}
                            >
                              {isCompleted && !isCurrent ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                            </div>
                            <p className={`text-xs text-center font-medium ${isCompleted ? "text-gray-800" : "text-gray-400"}`}>
                              {step.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-6 space-y-4">
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Need to speak with someone? Contact us directly and mention your reference number.
                    </p>
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
                    >
                      Contact Us <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── PHONE MODE ── */}
          {mode === "phone" && (
            <motion.div
              key="phone-mode"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18 }}
            >
              <form onSubmit={handlePhoneSearch} className="flex gap-3 mb-3">
                <div className="flex-1">
                  <input
                    type="tel"
                    value={inputPhone}
                    onChange={(e) => setInputPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full text-lg font-bold text-gray-900 placeholder:text-gray-300 border-0 border-b-2 border-gray-200 focus:border-teal-500 outline-none pb-2.5 bg-transparent transition-colors duration-200"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!inputPhone.trim()}
                  className="flex items-center gap-2 px-6 py-2 rounded-full bg-gray-950 text-white font-semibold text-sm hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  <Search className="w-4 h-4" /> Find
                </button>
              </form>
              <p className="text-xs text-gray-400 mb-10">
                Enter the 10-digit phone number you provided when submitting your enquiry.
              </p>

              {phoneLoading && searchPhone && (
                <div className="flex items-center gap-4 py-8">
                  <DottedSpinner size={36} />
                  <span className="text-sm text-gray-400 font-medium">Searching for your enquiry...</span>
                </div>
              )}

              {phoneError && searchPhone && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-red-100 bg-red-50 rounded-2xl p-6 space-y-2"
                >
                  <p className="font-bold text-red-600">No Open Enquiry Found</p>
                  <p className="text-sm text-gray-500">
                    We couldn't find an open enquiry linked to this number. Please check the number or{" "}
                    <Link href="/contact" className="text-teal-500 font-semibold hover:text-teal-700 transition-colors underline underline-offset-2">
                      contact us directly
                    </Link>.
                  </p>
                </motion.div>
              )}

              {phoneResult && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-5"
                >
                  <p className="text-[11px] text-gray-400 tracking-[0.2em] uppercase font-semibold">
                    Most recent open enquiry
                  </p>

                  <div className="border border-gray-100 bg-gray-50/50 rounded-2xl p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] text-gray-400 tracking-[0.2em] uppercase font-semibold mb-1">Reference Number</p>
                        <p className="font-mono font-black text-xl tracking-widest text-teal-600">
                          {phoneResult.referenceNumber ?? "—"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-gray-400 tracking-[0.2em] uppercase font-semibold mb-1">Submitted</p>
                        <p className="font-semibold text-gray-800">
                          {format(new Date(phoneResult.createdAt), "d MMM yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-[11px] text-gray-400 tracking-[0.2em] uppercase font-semibold mb-1">Status</p>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        (STATUS_CONFIG[phoneResult.status] ?? STATUS_CONFIG["new"]).bg
                      } ${(STATUS_CONFIG[phoneResult.status] ?? STATUS_CONFIG["new"]).color}`}>
                        {(STATUS_CONFIG[phoneResult.status] ?? STATUS_CONFIG["new"]).icon}
                        {(STATUS_CONFIG[phoneResult.status] ?? STATUS_CONFIG["new"]).label}
                      </div>
                    </div>
                  </div>

                  {phoneResult.referenceNumber && (
                    <button
                      onClick={() => handleSelectRef(phoneResult.referenceNumber ?? null)}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-teal-500 text-white font-semibold text-sm hover:bg-teal-600 transition-colors"
                    >
                      View Full Details <ArrowRight className="w-4 h-4" />
                    </button>
                  )}

                  <p className="text-xs text-gray-400">
                    Shows your most recent open enquiry. Closed enquiries are not shown here.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
