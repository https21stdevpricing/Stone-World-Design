import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAdminLogin, useGetAdminSession } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

const formSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const login = useAdminLogin();
  
  const { data: session, isLoading } = useGetAdminSession();

  useEffect(() => {
    if (session?.authenticated) {
      setLocation("/admin/dashboard");
    }
  }, [session, setLocation]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "" },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    login.mutate({ data: values }, {
      onSuccess: (data) => {
        if (data.success) {
          window.localStorage.setItem("sw-admin-token", data.token);
          window.location.href = "/admin/dashboard"; // hard reload to reset query client auth state
        }
      },
      onError: () => {
        toast({ title: "Login Failed", description: "Invalid password", variant: "destructive" });
      }
    });
  }

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8 bg-card p-8 rounded-2xl border shadow-sm">
        <div className="flex flex-col items-center justify-center space-y-4">
          <img src="/sw-logo.png" alt="Stone World" className="h-12 invert dark:invert-0" />
          <h1 className="text-2xl font-serif text-center">Admin Portal</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="password" placeholder="Enter Admin Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? "Authenticating..." : "Login"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
