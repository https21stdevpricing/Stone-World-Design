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
  const stages = [
    { label: "Received", color: "#00B4B4" },
    { label: "Review", color: "#00B4B4" },
    { label: "Quoted", color: "#00B4B4" },
    { label: "Done", color: "#00B4B4" },
  ];

  return (
    <svg width="260" height="110" viewBox="0 0 260 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Connecting line */}
      <motion.line
        x1="30" y1="44" x2="230" y2="44"
        stroke="#E5E7EB"
        strokeWidth="2"
        strokeDasharray="4 4"
      />
      <motion.line
        x1="30" y1="44" x2="230" y2="44"
        stroke="#00B4B4"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.8, ease: "easeInOut", delay: 0.3 }}
        strokeLinecap="round"
      />

      {stages.map((stage, i) => {
        const x = 30 + i * 66.7;
        return (
          <g key={i}>
            {/* Outer ring pulse */}
            <motion.circle
              cx={x}
              cy={44}
              r={18}
              fill="#00B4B4"
              fillOpacity={0.08}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: [1, 1.25, 1], opacity: [0.08, 0.18, 0.08] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
            />
            {/* Main circle */}
            <motion.circle
              cx={x}
              cy={44}
              r={12}
              fill={i === 0 ? "#00B4B4" : "white"}
              stroke="#00B4B4"
              strokeWidth="2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.25, type: "spring" }}
            />
            {/* Inner dot */}
            <motion.circle
              cx={x}
              cy={44}
              r={4}
              fill={i === 0 ? "white" : "#00B4B4"}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + i * 0.25 }}
            />
            {/* Label */}
            <motion.text
              x={x}
              y={72}
              textAnchor="middle"
              fontSize="9"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight="600"
              fill="#9CA3AF"
              initial={{ opacity: 0, y: 76 }}
              animate={{ opacity: 1, y: 72 }}
              transition={{ duration: 0.4, delay: 0.6 + i * 0.2 }}
            >
              {stage.label}
            </motion.text>
          </g>
        );
      })}

      {/* Document icon */}
      <motion.g
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.4 }}
      >
        <rect x="108" y="4" width="44" height="32" rx="5" fill="#F0FAFA" stroke="#00B4B4" strokeWidth="1.5"/>
        <line x1="116" y1="14" x2="144" y2="14" stroke="#00B4B4" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="116" y1="20" x2="138" y2="20" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="116" y1="26" x2="134" y2="26" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round"/>
      </motion.g>

      {/* Verified checkmark above last circle */}
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 1.6, type: "spring" }}
      >
        <circle cx="230" cy="18" r="9" fill="#00B4B4"/>
        <path d="M225 18 L228.5 21.5 L235 15" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </motion.g>
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

      {/* Apple Stories-style hero header — white, clean */}
      <div className="pt-16 bg-white border-b border-gray-100/80">
        <div className="max-w-2xl mx-auto px-6 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-teal-500 flex items-center justify-center">
                  <Search className="w-3.5 h-3.5 text-white" />
                </div>
                <p className="text-teal-600 text-[10px] tracking-[0.3em] font-black uppercase">Enquiry Status</p>
              </div>
              <h1
                className="font-black tracking-tight text-gray-950 leading-[1.02]"
                style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)" }}
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

      {/* Sticky breadcrumb bar — no extra padding */}
      <div className="border-b border-gray-100 bg-white/95 backdrop-blur-xl sticky top-16 z-30">
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-teal-500" />
          <span className="text-xs font-bold text-gray-600 tracking-wide">Track Enquiry</span>
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
