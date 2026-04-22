import { useState } from "react";
import { Footer } from "@/components/Footer";
import { useTrackEnquiry } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Search, CheckCircle2, Clock, MessageSquare, FileText, XCircle, ArrowRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Link } from "wouter";

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string; description: string }> = {
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

export default function Track() {
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const initialRef = searchParams.get("ref") ?? "";

  const [inputRef, setInputRef] = useState(initialRef);
  const [searchRef, setSearchRef] = useState(initialRef);

  const { data: enquiry, isLoading, isError } = useTrackEnquiry(
    { ref: searchRef },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { query: { enabled: !!searchRef, retry: false } } as any
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchRef(inputRef.trim().toUpperCase());
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
          className="space-y-4 mb-12"
        >
          <p className="text-[11px] text-teal-500 tracking-[0.3em] uppercase font-semibold">Enquiry Status</p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-950">Track Your Enquiry</h1>
          <p className="text-gray-400 text-base leading-relaxed">
            Enter the reference number from your confirmation to check the status of your enquiry.
          </p>
        </motion.div>

        <form onSubmit={handleSearch} className="flex gap-3 mb-12">
          <div className="flex-1">
            <input
              type="text"
              value={inputRef}
              onChange={(e) => setInputRef(e.target.value)}
              placeholder="e.g. SW-A1B2C3"
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

        {isLoading && searchRef && (
          <div className="flex items-center gap-3 text-gray-400 py-8">
            <Clock className="w-5 h-5 animate-spin" />
            <span className="text-sm">Looking up your enquiry...</span>
          </div>
        )}

        {isError && searchRef && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-red-100 bg-red-50 rounded-2xl p-6 space-y-2"
          >
            <p className="font-bold text-red-600">Enquiry Not Found</p>
            <p className="text-sm text-gray-500">
              We couldn't find an enquiry with reference <span className="font-mono font-semibold text-gray-800">{searchRef}</span>.{" "}
              Please double-check the reference number from your confirmation.
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
            {/* Status badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig.bg} ${statusConfig.color} font-semibold text-sm`}>
              {statusConfig.icon}
              {statusConfig.label}
            </div>

            {/* Enquiry card */}
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

            {/* Status description */}
            <div className={`p-5 rounded-2xl ${statusConfig.bg} border border-${statusConfig.color.replace("text-", "")}/20`}>
              <p className={`text-sm font-medium ${statusConfig.color} leading-relaxed`}>{statusConfig.description}</p>
            </div>

            {/* Journey tracker */}
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

            {/* Contact CTA */}
            <div className="border-t border-gray-100 pt-6 space-y-4">
              <p className="text-sm text-gray-400 leading-relaxed">
                Need to speak with someone about your enquiry? Contact us directly and mention your reference number.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  Contact Us <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
