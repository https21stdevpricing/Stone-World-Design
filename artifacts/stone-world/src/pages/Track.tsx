import { useState } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useTrackEnquiry } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, CheckCircle2, Clock, MessageSquare, FileText, XCircle, ArrowRight } from "lucide-react";
import { format, parseISO } from "date-fns";

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; description: string }> = {
  new: {
    label: "Received",
    icon: <CheckCircle2 className="w-6 h-6" />,
    color: "text-blue-600",
    description: "Your enquiry has been received and is waiting to be reviewed by our team.",
  },
  in_discussion: {
    label: "In Discussion",
    icon: <MessageSquare className="w-6 h-6" />,
    color: "text-amber-600",
    description: "Our team is currently reviewing your enquiry and will be in touch with you shortly.",
  },
  quoted: {
    label: "Quoted",
    icon: <FileText className="w-6 h-6" />,
    color: "text-emerald-600",
    description: "A quote has been prepared for your project. Our team will contact you with details.",
  },
  closed: {
    label: "Closed",
    icon: <XCircle className="w-6 h-6" />,
    color: "text-muted-foreground",
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
  const [location] = useLocation();
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const initialRef = searchParams.get("ref") ?? "";

  const [inputRef, setInputRef] = useState(initialRef);
  const [searchRef, setSearchRef] = useState(initialRef);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: enquiry, isLoading, isError, error } = useTrackEnquiry(
    { ref: searchRef },
    { query: { enabled: !!searchRef, retry: false } } as any
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchRef(inputRef.trim().toUpperCase());
  };

  const statusConfig = enquiry ? (STATUS_CONFIG[enquiry.status] ?? STATUS_CONFIG["new"]) : null;
  const currentStepIndex = enquiry ? getStepIndex(enquiry.status) : -1;

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Navbar />

      {/* Sticky page header */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center gap-2">
          <Search className="w-4 h-4 text-teal-500" />
          <span className="text-sm font-semibold text-gray-600">Track Enquiry</span>
        </div>
      </div>

      <main className="flex-1 flex flex-col pt-8 pb-16">
        <div className="container mx-auto px-4 max-w-2xl mt-4">
          <div className="space-y-4 mb-12">
            <p className="text-teal-500 text-sm tracking-widest uppercase font-bold">Enquiry Status</p>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Track Your Enquiry</h1>
            <p className="text-muted-foreground text-lg font-light">
              Enter the reference number from your confirmation to check the status of your enquiry.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3 mb-12">
            <div className="flex-1 relative">
              <Input
                value={inputRef}
                onChange={(e) => setInputRef(e.target.value)}
                placeholder="e.g. SW-A1B2C3 or SWA1B2C3"
                className="rounded-none border-b-2 border-t-0 border-x-0 border-border focus-visible:ring-0 focus-visible:border-primary px-0 bg-transparent text-lg h-12 tracking-wider uppercase"
              />
            </div>
            <Button
              type="submit"
              className="rounded-none px-6"
              disabled={!inputRef.trim()}
            >
              <Search className="w-4 h-4 mr-2" /> Track
            </Button>
          </form>

          {isLoading && searchRef && (
            <div className="flex items-center gap-3 text-muted-foreground py-8">
              <Clock className="w-5 h-5 animate-spin" />
              <span>Looking up your enquiry...</span>
            </div>
          )}

          {isError && searchRef && (
            <div className="border border-destructive/30 bg-destructive/5 p-6 space-y-2">
              <p className="font-medium text-destructive">Enquiry Not Found</p>
              <p className="text-sm text-muted-foreground">
                We couldn't find an enquiry with reference <span className="font-mono font-medium">{searchRef}</span>.
                Please double-check the reference number from your confirmation message.
              </p>
            </div>
          )}

          {enquiry && statusConfig && (
            <div className="space-y-8">
              <div className="border border-border/50 p-6 space-y-4 bg-muted/10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Reference Number</p>
                    <p className="font-mono font-semibold text-lg tracking-wider">{enquiry.referenceNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Submitted</p>
                    <p className="font-medium">{format(parseISO(enquiry.createdAt), "d MMM yyyy")}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Customer Name</p>
                  <p className="font-medium">{enquiry.name}</p>
                </div>
                {enquiry.productInterest && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Product Interest</p>
                    <p className="font-medium">{enquiry.productInterest}</p>
                  </div>
                )}
              </div>

              <div>
                <div className={`flex items-center gap-3 mb-3 ${statusConfig.color}`}>
                  {statusConfig.icon}
                  <h2 className="text-2xl font-serif">Status: {statusConfig.label}</h2>
                </div>
                <p className="text-muted-foreground">{statusConfig.description}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Journey</p>
                <div className="relative">
                  <div className="flex items-center justify-between">
                    {JOURNEY_STEPS.map((step, index) => {
                      const isCompleted = index <= currentStepIndex;
                      const isCurrent = index === currentStepIndex;
                      return (
                        <div key={step.key} className="flex-1 flex flex-col items-center relative">
                          {index < JOURNEY_STEPS.length - 1 && (
                            <div
                              className={`absolute top-4 left-1/2 w-full h-0.5 ${
                                index < currentStepIndex ? "bg-primary" : "bg-border"
                              }`}
                            />
                          )}
                          <div
                            className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                              isCurrent
                                ? "border-primary bg-primary text-primary-foreground"
                                : isCompleted
                                ? "border-primary bg-primary/20 text-primary"
                                : "border-border bg-background text-muted-foreground"
                            }`}
                          >
                            {isCompleted ? (
                              isCurrent ? index + 1 : <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <p className={`mt-2 text-xs text-center font-medium ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="border-t border-border/40 pt-6">
                <p className="text-sm text-muted-foreground">
                  Need to speak with someone about your enquiry? Contact us directly and mention your reference number.
                </p>
                <Button variant="outline" className="rounded-none mt-4" onClick={() => window.location.href = "/contact"}>
                  Contact Us <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
