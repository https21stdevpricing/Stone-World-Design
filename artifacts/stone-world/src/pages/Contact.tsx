import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCreateEnquiry, useGetPublicSettings } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, ArrowRight, MapPin, Phone, Mail, MessageSquare } from "lucide-react";
import { EnquiryAudience } from "@workspace/api-client-react";

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
    message: ""
  });

  const createEnquiry = useCreateEnquiry();
  const { data: settings } = useGetPublicSettings();

  const handleAudienceSelect = (val: EnquiryAudience) => {
    setFormData({ ...formData, audience: val });
    setStep(2);
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      productInterest: prev.productInterest.includes(interest)
        ? prev.productInterest.filter(i => i !== interest)
        : [...prev.productInterest, interest]
    }));
  };

  const submitForm = () => {
    if (!formData.name || !formData.phone || !formData.message) return;
    
    createEnquiry.mutate({
      data: {
        audience: formData.audience || "homeowner",
        name: formData.name,
        phone: formData.phone,
        email: formData.email || null,
        location: formData.location || null,
        message: formData.message,
        productInterest: formData.productInterest.join(", ") || null
      }
    }, {
      onSuccess: (data) => {
        setReferenceNumber(data.referenceNumber ?? "");
        setStep(4);
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <Navbar />
      
      <main className="flex-1 flex flex-col pt-24 pb-12">
        <div className="container mx-auto px-4 flex-1 flex flex-col md:flex-row gap-16 mt-8 max-w-6xl">
          
          {/* Main Flow Area */}
          <div className="flex-1 min-h-[600px] relative">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-12 pt-12"
                >
                  <div className="space-y-4">
                    <p className="text-primary text-sm tracking-widest uppercase font-bold">Step 01</p>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Who are you?</h1>
                    <p className="text-muted-foreground text-lg font-medium">Help us tailor the experience to your needs.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { id: "homeowner", label: "Homeowner" },
                      { id: "contractor", label: "Contractor / Builder" },
                      { id: "architect", label: "Architect / Designer" },
                      { id: "developer", label: "Real Estate Developer" }
                    ].map((role) => (
                      <button
                        key={role.id}
                        onClick={() => handleAudienceSelect(role.id as EnquiryAudience)}
                        className="p-8 text-left border border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-primary/60 rounded-2xl transition-all duration-300 group"
                      >
                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{role.label}</h3>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-12 pt-12"
                >
                  <div className="space-y-4">
                    <p className="text-primary text-sm tracking-widest uppercase font-bold">Step 02</p>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">What are you looking for?</h1>
                    <p className="text-muted-foreground text-lg font-medium">Select all that apply to your project.</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {["Marble", "Quartz", "Tiles", "Sanitaryware", "Ceramic", "TMT Bars", "Cement", "Stone"].map((tag) => {
                      const isSelected = formData.productInterest.includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleInterest(tag)}
                          className={`px-6 py-3 rounded-full text-sm font-bold tracking-wider transition-all duration-300 border ${
                            isSelected 
                              ? 'bg-primary text-primary-foreground border-primary' 
                              : 'bg-transparent border-border text-foreground hover:border-foreground'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-8 flex gap-4">
                    <Button variant="ghost" onClick={() => setStep(1)} className="rounded-full font-bold">Back</Button>
                    <Button onClick={() => setStep(3)} className="rounded-full px-8 font-bold">Continue <ArrowRight className="ml-2 w-4 h-4" /></Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-12 pt-12 max-w-2xl"
                >
                  <div className="space-y-4">
                    <p className="text-primary text-sm tracking-widest uppercase font-bold">Step 03</p>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Tell us about your project</h1>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold">Name *</label>
                        <Input 
                          value={formData.name} 
                          onChange={e => setFormData({...formData, name: e.target.value})} 
                          className="rounded-none border-b-2 border-t-0 border-x-0 border-border focus-visible:ring-0 focus-visible:border-primary px-0 bg-transparent transition-colors"
                          placeholder="Your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold">Phone *</label>
                        <Input 
                          value={formData.phone} 
                          onChange={e => setFormData({...formData, phone: e.target.value})} 
                          className="rounded-none border-b-2 border-t-0 border-x-0 border-border focus-visible:ring-0 focus-visible:border-primary px-0 bg-transparent transition-colors"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold">Email (Optional)</label>
                        <Input 
                          value={formData.email} 
                          onChange={e => setFormData({...formData, email: e.target.value})} 
                          className="rounded-none border-b-2 border-t-0 border-x-0 border-border focus-visible:ring-0 focus-visible:border-primary px-0 bg-transparent transition-colors"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold">Location / City</label>
                        <Input 
                          value={formData.location} 
                          onChange={e => setFormData({...formData, location: e.target.value})} 
                          className="rounded-none border-b-2 border-t-0 border-x-0 border-border focus-visible:ring-0 focus-visible:border-primary px-0 bg-transparent transition-colors"
                          placeholder="Delhi, Mumbai..."
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Message *</label>
                      <Textarea 
                        value={formData.message} 
                        onChange={e => setFormData({...formData, message: e.target.value})} 
                        className="rounded-none border-2 border-border focus-visible:ring-0 focus-visible:border-primary bg-transparent min-h-[120px] resize-none transition-colors"
                        placeholder="Briefly describe your requirement or vision..."
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <Button variant="ghost" onClick={() => setStep(2)} className="rounded-full font-bold">Back</Button>
                    <Button 
                      onClick={submitForm} 
                      disabled={!formData.name || !formData.phone || !formData.message || createEnquiry.isPending}
                      className="rounded-full px-8 font-bold"
                    >
                      {createEnquiry.isPending ? "Sending..." : "Submit Enquiry"}
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div 
                  key="step4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-full text-center space-y-6 pt-16"
                >
                  <CheckCircle2 className="w-20 h-20 text-primary mb-4" />
                  <h1 className="text-4xl font-bold tracking-tight text-foreground">Enquiry Received</h1>
                  <p className="text-muted-foreground text-lg font-medium max-w-md">
                    Thank you for reaching out to AB Stone World. One of our experts will contact you shortly to discuss your project.
                  </p>
                  {referenceNumber && (
                    <div className="border border-border/50 bg-muted/20 px-8 py-6 space-y-2 max-w-sm w-full">
                      <p className="text-sm text-muted-foreground uppercase tracking-widest">Your Reference Number</p>
                      <p className="text-2xl font-mono font-bold tracking-widest text-primary">{referenceNumber}</p>
                      <p className="text-xs text-muted-foreground">Save this number to track your enquiry status</p>
                    </div>
                  )}
                  <div className="flex gap-3 flex-wrap justify-center mt-4">
                    {referenceNumber && (
                      <Button className="rounded-full px-6 font-bold" onClick={() => window.location.href = `/track?ref=${referenceNumber}`}>
                        Track Enquiry
                      </Button>
                    )}
                    <Button variant="outline" className="rounded-full mt-2 font-bold" onClick={() => window.location.reload()}>
                      Send Another Message
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Contact Sidebar */}
          <div className="w-full md:w-80 flex-shrink-0 pt-12 md:border-l border-border/40 md:pl-16">
            <div className="space-y-10 sticky top-32">
              <div>
                <h3 className="font-bold tracking-tight text-2xl mb-6">Connect Directly</h3>
                <p className="text-muted-foreground font-medium text-sm">
                  Prefer speaking with someone immediately? Reach out through our direct channels.
                </p>
              </div>

              <div className="space-y-6">
                {settings?.address && (
                  <div className="flex gap-4 items-start">
                    <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="text-sm font-medium text-foreground/80 leading-relaxed">{settings.address}</div>
                  </div>
                )}
                {settings?.phone && (
                  <div className="flex gap-4 items-start">
                    <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <a href={`tel:${settings.phone}`} className="text-sm font-bold text-foreground/80 hover:text-primary transition-colors">{settings.phone}</a>
                  </div>
                )}
                {settings?.whatsapp && (
                  <div className="flex gap-4 items-start">
                    <MessageSquare className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-foreground/80 hover:text-primary transition-colors">WhatsApp Us</a>
                  </div>
                )}
                {settings?.email && (
                  <div className="flex gap-4 items-start">
                    <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <a href={`mailto:${settings.email}`} className="text-sm font-bold text-foreground/80 hover:text-primary transition-colors">{settings.email}</a>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
