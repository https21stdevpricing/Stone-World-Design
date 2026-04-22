import { useState } from "react";
import { Footer } from "@/components/Footer";
import { useTrackEnquiry, useTrackEnquiryByPhone } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, CheckCircle2, Clock, MessageSquare, FileText, XCircle,
  ArrowRight, Phone, Hash, ChevronRight
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

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG["new"];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
      {status === "new" && <CheckCircle2 className="w-3 h-3" />}
      {status === "in_discussion" && <MessageSquare className="w-3 h-3" />}
      {status === "quoted" && <FileText className="w-3 h-3" />}
      {status === "closed" && <XCircle className="w-3 h-3" />}
      {cfg.label}
    </span>
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

  const { data: enquiry, isLoading: refLoading, isError: refError } = useTrackEnquiry(
    { ref: searchRef },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { query: { enabled: !!searchRef, retry: false } } as any
  );

  const { data: phoneResult, isLoading: phoneLoading, isError: phoneError } = useTrackEnquiryByPhone(
    { phone: searchPhone },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { query: { enabled: !!searchPhone, retry: false } } as any
  );

  const handleRefSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchRef(inputRef.trim().toUpperCase());
  };

  const handlePhoneSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchPhone(inputPhone.trim());
  };

  const handleSelectRef = (ref: string) => {
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

      {/* Page header */}
      <div className="pt-16 border-b border-gray-100 bg-white sticky top-16 z-30">
        <div className="max-w-2xl mx-auto px-6 py-3.5 flex items-center gap-2">
          <Search className="w-4 h-4 text-teal-500" />
          <span className="text-sm font-semibold text-gray-600">Track Enquiry</span>
        </div>
      </div>

      <main className="flex-1 max-w-2xl mx-auto px-6 py-16 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4 mb-10"
        >
          <p className="text-[11px] text-teal-500 tracking-[0.3em] uppercase font-semibold">Enquiry Status</p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-950">Track Your Enquiry</h1>
          <p className="text-gray-400 text-base leading-relaxed">
            Look up your enquiry by reference number, or by the phone number you used when submitting.
          </p>
        </motion.div>

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
              <form onSubmit={handleRefSearch} className="flex gap-3 mb-10">
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

              <p className="text-xs text-gray-400 -mt-6 mb-10">
                Lost your reference?{" "}
                <button
                  onClick={() => switchMode("phone")}
                  className="text-teal-500 font-semibold hover:text-teal-700 transition-colors underline underline-offset-2"
                >
                  Look up by phone number instead
                </button>
              </p>

              {refLoading && searchRef && (
                <div className="flex items-center gap-3 text-gray-400 py-8">
                  <Clock className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Looking up your enquiry...</span>
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
                Enter the phone number you provided when submitting your enquiry.
              </p>

              {phoneLoading && searchPhone && (
                <div className="flex items-center gap-3 text-gray-400 py-8">
                  <Clock className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Searching for your enquiries...</span>
                </div>
              )}

              {phoneError && searchPhone && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-red-100 bg-red-50 rounded-2xl p-6 space-y-2"
                >
                  <p className="font-bold text-red-600">No Enquiries Found</p>
                  <p className="text-sm text-gray-500">
                    We couldn't find any enquiries linked to this phone number. Please check the number or{" "}
                    <Link href="/contact" className="text-teal-500 font-semibold hover:text-teal-700 transition-colors underline underline-offset-2">
                      contact us directly
                    </Link>.
                  </p>
                </motion.div>
              )}

              {phoneResult && phoneResult.enquiries.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-5"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-gray-400 tracking-[0.2em] uppercase font-semibold">
                      {phoneResult.enquiries.length} enquir{phoneResult.enquiries.length === 1 ? "y" : "ies"} found
                    </p>
                    <p className="text-xs text-gray-400">Click to see full details</p>
                  </div>

                  <div className="space-y-3">
                    {phoneResult.enquiries.map((item) => {
                      const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG["new"];
                      return (
                        <button
                          key={item.referenceNumber}
                          onClick={() => handleSelectRef(item.referenceNumber ?? "")}
                          className="w-full text-left p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:border-teal-300 hover:bg-teal-50/30 transition-all duration-200 group"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <span className="font-mono font-black text-teal-600 text-base tracking-wider">
                                  {item.referenceNumber ?? "—"}
                                </span>
                                <StatusBadge status={item.status} />
                              </div>
                              {item.productInterest && (
                                <p className="text-xs text-gray-500 truncate">{item.productInterest}</p>
                              )}
                              <p className="text-xs text-gray-400 mt-1">
                                {format(new Date(item.createdAt), "d MMM yyyy")}
                              </p>
                            </div>
                            <div className="shrink-0 flex items-center gap-1 text-xs font-semibold text-gray-400 group-hover:text-teal-600 transition-colors mt-1">
                              View <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-xs text-gray-400 pt-2">
                    Showing up to 5 most recent enquiries. Click any entry to see its full status and journey.
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
