import { useState } from "react";
import { Footer } from "@/components/Footer";
import { useCreateEnquiry, useGetPublicSettings } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, ArrowRight, MapPin, Phone, Mail,
  MessageCircle, ArrowLeft, AlertCircle, MessageSquare
} from "lucide-react";
import { EnquiryAudience } from "@workspace/api-client-react";
import { Link } from "wouter";

const AUDIENCES = [
  { id: "homeowner" as EnquiryAudience, label: "Homeowner", sub: "Renovating or building a personal space" },
  { id: "contractor" as EnquiryAudience, label: "Contractor", sub: "Managing construction projects for clients" },
  { id: "architect" as EnquiryAudience, label: "Architect / Designer", sub: "Specifying materials for design projects" },
  { id: "developer" as EnquiryAudience, label: "Developer", sub: "Large-scale residential or commercial projects" },
];

const INTERESTS = ["Marble", "Quartz", "Tiles", "Sanitaryware", "Ceramic", "TMT Bars", "Cement", "Natural Stone"];

const SLIDE = {
  initial: { opacity: 0, x: 28, y: 0 },
  animate: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: -28, y: 0 },
  transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
};

function ContactIllustration() {
  return (
    <svg width="220" height="160" viewBox="0 0 220 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Phone outline */}
      <motion.rect
        x="70" y="20" width="80" height="120" rx="12"
        stroke="#E5E7EB" strokeWidth="2.5" fill="white"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      />
      {/* Screen */}
      <motion.rect
        x="78" y="34" width="64" height="82" rx="4"
        fill="#F8FFFE"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      />
      {/* Message bubbles on screen */}
      <motion.rect
        x="84" y="42" width="38" height="10" rx="5"
        fill="#00B4B4"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      />
      <motion.rect
        x="84" y="57" width="52" height="10" rx="5"
        fill="#E5E7EB"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.8 }}
      />
      <motion.rect
        x="84" y="72" width="44" height="10" rx="5"
        fill="#00B4B4"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 1.0 }}
      />
      <motion.rect
        x="84" y="87" width="30" height="10" rx="5"
        fill="#E5E7EB"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 1.2 }}
      />
      {/* Typing indicator */}
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          cx={89 + i * 8}
          cy={107}
          r={2.5}
          fill="#9CA3AF"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
      {/* Home button */}
      <motion.circle
        cx="110" cy="128" r="5"
        stroke="#E5E7EB" strokeWidth="1.5" fill="white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      />

      {/* Floating notification badge */}
      <motion.g
        initial={{ opacity: 0, scale: 0, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.5, type: "spring" }}
      >
        <rect x="128" y="12" width="72" height="30" rx="8" fill="#00B4B4"/>
        <text x="164" y="22" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="white" fontFamily="system-ui">We'll reply</text>
        <text x="164" y="33" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="rgba(255,255,255,0.8)" fontFamily="system-ui">within 24hrs</text>
      </motion.g>

      {/* Map pin */}
      <motion.g
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4, type: "spring", stiffness: 200 }}
      >
        <ellipse cx="28" cy="140" rx="10" ry="4" fill="#E5E7EB"/>
        <path d="M28 90 C20 90 14 96 14 104 C14 116 28 130 28 130 C28 130 42 116 42 104 C42 96 36 90 28 90Z" fill="#1A1A1A"/>
        <circle cx="28" cy="104" r="5" fill="white"/>
        <motion.circle
          cx="28" cy="104" r="9"
          stroke="#00B4B4" strokeWidth="1.5" fill="none"
          animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        />
      </motion.g>
    </svg>
  );
}

export default function Contact() {
  const [step, setStep] = useState(1);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [formData, setFormData] = useState({
    audience: "" as EnquiryAudience,
    productInterest: [] as string[],
    name: "",
    phone: "",
    email: "",
    location: "",
    message: "",
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const createEnquiry = useCreateEnquiry();
  const { data: settings } = useGetPublicSettings();

  const toggleInterest = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      productInterest: prev.productInterest.includes(tag)
        ? prev.productInterest.filter((i) => i !== tag)
        : [...prev.productInterest, tag],
    }));
  };

  const canSubmit = formData.name.trim() && formData.phone.trim() && formData.message.trim();

  const submit = () => {
    if (!canSubmit) return;
    setSubmitError(null);
    createEnquiry.mutate(
      {
        data: {
          audience: formData.audience || "homeowner",
          name: formData.name,
          phone: formData.phone,
          email: formData.email || null,
          location: formData.location || null,
          message: formData.message,
          productInterest: formData.productInterest.join(", ") || null,
        },
      },
      {
        onSuccess: (data) => {
          setReferenceNumber(data.referenceNumber ?? "");
          setStep(5);
        },
        onError: () => {
          setSubmitError("Something went wrong. Please try again or contact us directly.");
        },
      }
    );
  };

  const progress = ((step - 1) / 4) * 100;

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── APPLE STORIES HERO ── */}
      <div className="pt-16 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-teal-500 flex items-center justify-center">
                  <MessageSquare className="w-3.5 h-3.5 text-white" />
                </div>
                <p className="text-teal-600 text-[10px] tracking-[0.3em] font-black uppercase">Get in Touch</p>
              </div>
              <h1
                className="font-black tracking-tight text-gray-950 leading-[1.02]"
                style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
              >
                Start Your<br />Project Today.
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                Tell us about your project and our material specialists will craft a personalised recommendation within 24 hours.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="hidden sm:block shrink-0"
            >
              <ContactIllustration />
            </motion.div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">

        {/* ── LEFT: FORM ── */}
        <div className="flex-1 flex flex-col">

          {/* Progress header */}
          <div className="border-b border-gray-100/80 bg-white/85 backdrop-blur-xl sticky top-16 z-30">
            <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
              {step > 1 && step < 5 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-teal-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-[11px] text-gray-400 font-medium shrink-0">
                {step < 5 ? `${step} / 4` : "Done"}
              </span>
            </div>
          </div>

          <div className="flex-1 max-w-2xl mx-auto px-6 py-12 w-full">
            <AnimatePresence mode="wait" initial={false}>

              {/* STEP 1: Who are you */}
              {step === 1 && (
                <motion.div key="s1" {...SLIDE} className="space-y-10">
                  <div>
                    <p className="text-[11px] text-teal-500 tracking-[0.3em] uppercase font-semibold mb-3">Step 1 of 4</p>
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-950 mb-2">
                      Who are you?
                    </h2>
                    <p className="text-gray-400 text-base">Help us tailor the experience to your needs.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {AUDIENCES.map((role) => (
                      <button
                        key={role.id}
                        onClick={() => { setFormData(p => ({ ...p, audience: role.id })); setStep(2); }}
                        className="group p-6 text-left border border-gray-200 rounded-2xl hover:border-teal-400 hover:bg-teal-50/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
                      >
                        <h3 className="text-lg font-bold text-gray-950 group-hover:text-teal-700 transition-colors">{role.label}</h3>
                        <p className="text-sm text-gray-400 mt-1 leading-snug">{role.sub}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Interests */}
              {step === 2 && (
                <motion.div key="s2" {...SLIDE} className="space-y-10">
                  <div>
                    <p className="text-[11px] text-teal-500 tracking-[0.3em] uppercase font-semibold mb-3">Step 2 of 4</p>
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-950 mb-2">
                      What are you looking for?
                    </h2>
                    <p className="text-gray-400 text-base">Select all that apply to your project.</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {INTERESTS.map((tag) => {
                      const active = formData.productInterest.includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleInterest(tag)}
                          className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 ${
                            active
                              ? "bg-teal-500 text-white border-teal-500 shadow-sm"
                              : "bg-white text-gray-700 border-gray-200 hover:border-teal-400 hover:text-teal-600"
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gray-950 text-white font-semibold text-sm hover:bg-gray-800 transition-colors"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {/* STEP 3: Details */}
              {step === 3 && (
                <motion.div key="s3" {...SLIDE} className="space-y-10">
                  <div>
                    <p className="text-[11px] text-teal-500 tracking-[0.3em] uppercase font-semibold mb-3">Step 3 of 4</p>
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-950 mb-2">
                      A little about you.
                    </h2>
                    <p className="text-gray-400 text-base">We need just your name and number to get started.</p>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <label className="text-[11px] text-gray-400 tracking-[0.2em] uppercase font-semibold block mb-2">Your Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                        placeholder="Full name"
                        className="w-full text-xl font-bold text-gray-950 placeholder:text-gray-300 border-0 border-b-2 border-gray-200 focus:border-teal-500 outline-none pb-2 bg-transparent transition-colors duration-200"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-400 tracking-[0.2em] uppercase font-semibold block mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                        placeholder="+91 _____ _____"
                        className="w-full text-xl font-bold text-gray-950 placeholder:text-gray-300 border-0 border-b-2 border-gray-200 focus:border-teal-500 outline-none pb-2 bg-transparent transition-colors duration-200"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="text-[11px] text-gray-400 tracking-[0.2em] uppercase font-semibold block mb-2">Email (optional)</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                          placeholder="your@email.com"
                          className="w-full text-base font-medium text-gray-700 placeholder:text-gray-300 border-0 border-b border-gray-200 focus:border-teal-500 outline-none pb-2 bg-transparent transition-colors duration-200"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-400 tracking-[0.2em] uppercase font-semibold block mb-2">City (optional)</label>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                          placeholder="Delhi, Mumbai, Bangalore..."
                          className="w-full text-base font-medium text-gray-700 placeholder:text-gray-300 border-0 border-b border-gray-200 focus:border-teal-500 outline-none pb-2 bg-transparent transition-colors duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => { if (formData.name && formData.phone) setStep(4); }}
                    disabled={!formData.name || !formData.phone}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gray-950 text-white font-semibold text-sm hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {/* STEP 4: Project message */}
              {step === 4 && (
                <motion.div key="s4" {...SLIDE} className="space-y-10">
                  <div>
                    <p className="text-[11px] text-teal-500 tracking-[0.3em] uppercase font-semibold mb-3">Step 4 of 4</p>
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-950 mb-2">
                      Tell us your vision.
                    </h2>
                    <p className="text-gray-400 text-base">Describe your project, requirements, or any questions you have.</p>
                  </div>
                  <div>
                    <textarea
                      value={formData.message}
                      onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                      placeholder="I'm renovating my living room and looking for Italian marble flooring. My budget is around ₹80k and I want something that's easy to maintain..."
                      rows={6}
                      className="w-full text-base text-gray-700 placeholder:text-gray-300 border border-gray-200 rounded-2xl p-5 focus:border-teal-500 outline-none bg-transparent transition-colors duration-200 resize-none leading-relaxed"
                    />
                    <p className="text-xs text-gray-400 mt-2">{formData.message.length} characters</p>
                  </div>
                  {submitError && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-600">{submitError}</p>
                    </div>
                  )}
                  <button
                    onClick={submit}
                    disabled={!canSubmit || createEnquiry.isPending}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-teal-500 text-white font-semibold text-sm hover:bg-teal-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-teal-500/25"
                  >
                    {createEnquiry.isPending ? "Sending..." : "Submit Enquiry"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {/* STEP 5: Success */}
              {step === 5 && (
                <motion.div
                  key="s5"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35 }}
                  className="flex flex-col items-center text-center py-12 space-y-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                    className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-8 h-8 text-teal-500" />
                  </motion.div>
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-950 mb-3">
                      Enquiry Received!
                    </h2>
                    <p className="text-gray-500 leading-relaxed max-w-md">
                      Thank you, <strong className="text-gray-800">{formData.name}</strong>. Our material specialists will reach out to you at <strong className="text-gray-800">{formData.phone}</strong> within 24 hours.
                    </p>
                  </div>

                  {referenceNumber && (
                    <div className="border border-teal-200 bg-teal-50/50 rounded-2xl px-8 py-6 space-y-2 w-full max-w-sm">
                      <p className="text-[11px] text-gray-400 tracking-[0.2em] uppercase font-semibold">Your Reference Number</p>
                      <p className="text-2xl font-black tracking-widest text-teal-600 font-mono">{referenceNumber}</p>
                      <p className="text-xs text-gray-400">Save this to track your enquiry status</p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    {referenceNumber && (
                      <Link
                        href={`/track?ref=${referenceNumber}`}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-950 text-white font-semibold text-sm hover:bg-gray-800 transition-colors"
                      >
                        Track Enquiry
                      </Link>
                    )}
                    <Link
                      href="/discover"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
                    >
                      Browse Materials
                    </Link>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        {/* ── RIGHT: SIDEBAR ── */}
        <div className="hidden lg:flex flex-col w-80 xl:w-96 border-l border-gray-100 bg-gray-50/50">
          <div className="sticky top-16 p-10 space-y-10">
            <div>
              <h3 className="font-black text-xl text-gray-950 tracking-tight mb-2">Connect Directly</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Prefer to speak with someone immediately? Reach out directly.
              </p>
            </div>

            <div className="space-y-5">
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-teal-500" />
                </div>
                <div className="text-sm text-gray-600 leading-relaxed">
                  {settings?.address || "Pitampura, New Delhi, India"}
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-teal-500" />
                </div>
                <a href={`tel:${settings?.phone || "+919999999999"}`} className="text-sm font-semibold text-gray-700 hover:text-teal-600 transition-colors">
                  {settings?.phone || "+91 99999 99999"}
                </a>
              </div>
              {settings?.whatsapp && (
                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-4 h-4 text-teal-500" />
                  </div>
                  <a
                    href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-gray-700 hover:text-teal-600 transition-colors"
                  >
                    WhatsApp Us
                  </a>
                </div>
              )}
              {settings?.email && (
                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-teal-500" />
                  </div>
                  <a href={`mailto:${settings.email}`} className="text-sm font-semibold text-gray-700 hover:text-teal-600 transition-colors">
                    {settings.email}
                  </a>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-gray-200">
              <p className="text-[11px] text-gray-400 tracking-[0.2em] uppercase font-semibold mb-4">Business Hours</p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex justify-between">
                  <span>Monday – Saturday</span>
                  <span className="font-semibold text-gray-700">9 AM – 7 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="font-semibold text-gray-700">11 AM – 4 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}