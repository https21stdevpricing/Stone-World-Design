import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCreateEnquiry, useGetPublicSettings } from "@workspace/api-client-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSearch } from "wouter";

const formSchema = z.object({
  audience: z.enum(["homeowner", "contractor", "architect", "developer"]),
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  phone: z.string().min(10, "Valid phone number is required"),
  projectType: z.string().optional(),
  budget: z.string().optional(),
  productInterest: z.string().optional(),
  location: z.string().optional(),
  message: z.string().min(10, "Please provide some details about your requirement"),
});

export default function Contact() {
  const { toast } = useToast();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const initialInterest = params.get("interest") || "";

  const createEnquiry = useCreateEnquiry();
  const { data: siteSettings } = useGetPublicSettings();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      audience: "homeowner",
      name: "",
      email: "",
      phone: "",
      projectType: "",
      budget: "",
      productInterest: initialInterest,
      location: "",
      message: "",
    },
  });

  const audience = form.watch("audience");

  function onSubmit(values: z.infer<typeof formSchema>) {
    createEnquiry.mutate({
      data: {
        ...values,
        email: values.email || null,
        projectType: values.projectType || null,
        budget: values.budget || null,
        productInterest: values.productInterest || null,
        location: values.location || null,
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Enquiry Sent",
          description: "We have received your enquiry. Our team will contact you shortly.",
        });
        form.reset();
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to send enquiry. Please try again or call us.",
          variant: "destructive"
        });
      }
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_400px] gap-16">
            
            {/* Form Section */}
            <div>
              <h1 className="text-4xl font-serif mb-2">Get in Touch</h1>
              <p className="text-muted-foreground mb-8">
                Tell us about your project, and we'll help you find the perfect materials.
              </p>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  <FormField
                    control={form.control}
                    name="audience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>I am a...</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your profile" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="homeowner">Homeowner</SelectItem>
                            <SelectItem value="contractor">Contractor</SelectItem>
                            <SelectItem value="architect">Architect / Interior Designer</SelectItem>
                            <SelectItem value="developer">Real Estate Developer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name {audience !== "homeowner" && "/ Company Name"}</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="+91 98765 43210" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location / City</FormLabel>
                          <FormControl>
                            <Input placeholder="Mumbai" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {audience === "homeowner" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="projectType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="New Build">New Build</SelectItem>
                                <SelectItem value="Renovation">Renovation</SelectItem>
                                <SelectItem value="Interior">Interior Styling</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="budget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estimated Budget</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. ₹5 Lakhs - ₹10 Lakhs" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      <FormField
                        control={form.control}
                        name="projectType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Scale / Timeline</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 50 Villas, starting next month" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="productInterest"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Interest</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Italian Marble, Quartz Countertops" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message *</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Please describe your requirements in detail..." className="min-h-[120px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" size="lg" className="w-full md:w-auto" disabled={createEnquiry.isPending}>
                    {createEnquiry.isPending ? "Sending..." : "Submit Enquiry"}
                  </Button>

                </form>
              </Form>
            </div>

            {/* Contact Info Card */}
            <div className="space-y-8">
              <div className="bg-muted p-8 rounded-2xl">
                <h3 className="font-serif text-2xl mb-6">Head Office</h3>
                <div className="space-y-4 text-muted-foreground">
                  {siteSettings?.address && (
                    <p><strong>Address:</strong><br/>{siteSettings.address}</p>
                  )}
                  {siteSettings?.phone && (
                    <p>
                      <strong>Phone:</strong><br/>
                      <a href={`tel:${siteSettings.phone}`} className="hover:text-primary transition-colors">
                        {siteSettings.phone}
                      </a>
                    </p>
                  )}
                  {siteSettings?.whatsapp && (
                    <p>
                      <strong>WhatsApp:</strong><br/>
                      <a
                        href={`https://wa.me/${siteSettings.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                      >
                        {siteSettings.whatsapp}
                      </a>
                    </p>
                  )}
                  {siteSettings?.email && (
                    <p>
                      <strong>Email:</strong><br/>
                      <a href={`mailto:${siteSettings.email}`} className="hover:text-primary transition-colors">
                        {siteSettings.email}
                      </a>
                    </p>
                  )}
                  <p><strong>Working Hours:</strong><br/>Mon - Sat: 10:00 AM - 7:00 PM<br/>Sun: Closed</p>
                </div>
              </div>
              
              <div className="aspect-square bg-muted rounded-2xl overflow-hidden relative">
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                  <span className="text-sm font-medium">Map View</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
