import { useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bell, Lock, Wifi } from "lucide-react";

const settingsSchema = z.object({
  companyName: z.string().min(1),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  whatsapp: z.string().optional(),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  facebookUrl: z.string().url().optional().or(z.literal("")),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  notificationsEnabled: z.boolean().optional(),
  smtpHost: z.string().optional(),
  smtpPort: z.string().optional(),
  smtpUser: z.string().optional(),
  smtpPass: z.string().optional(),
  smtpFrom: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function AdminSettings() {
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      companyName: "",
      address: "",
      phone: "",
      email: "",
      whatsapp: "",
      instagramUrl: "",
      facebookUrl: "",
      currentPassword: "",
      newPassword: "",
      notificationsEnabled: false,
      smtpHost: "",
      smtpPort: "",
      smtpUser: "",
      smtpPass: "",
      smtpFrom: "",
    }
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        companyName: settings.companyName,
        address: settings.address ?? "",
        phone: settings.phone ?? "",
        email: settings.email ?? "",
        whatsapp: settings.whatsapp ?? "",
        instagramUrl: settings.instagramUrl ?? "",
        facebookUrl: settings.facebookUrl ?? "",
        currentPassword: "",
        newPassword: "",
        notificationsEnabled: settings.notificationsEnabled,
        smtpHost: settings.smtpHost ?? "",
        smtpPort: settings.smtpPort ?? "",
        smtpUser: settings.smtpUser ?? "",
        smtpPass: "",
        smtpFrom: settings.smtpFrom ?? "",
      });
    }
  }, [settings, form]);

  const onSubmit = (values: SettingsFormValues) => {
    updateSettings.mutate({ data: values }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
        toast({ title: "Settings updated successfully" });
        form.setValue("currentPassword", "");
        form.setValue("newPassword", "");
        form.setValue("smtpPass", "");
      },
      onError: (e: unknown) => {
        const message = e instanceof Error ? e.message : "An error occurred";
        toast({ title: "Update failed", description: message, variant: "destructive" });
      }
    });
  };

  const notificationsEnabled = form.watch("notificationsEnabled");

  if (isLoading) return <AdminLayout>Loading...</AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-serif">Settings</h1>
        <p className="text-muted-foreground">Manage your business profile and notifications.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
          
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="companyName" render={({ field }) => (
                <FormItem><FormLabel>Company Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl></FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social & Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="whatsapp" render={({ field }) => (
                <FormItem><FormLabel>WhatsApp Number</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="instagramUrl" render={({ field }) => (
                  <FormItem><FormLabel>Instagram URL</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="facebookUrl" render={({ field }) => (
                  <FormItem><FormLabel>Facebook URL</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start gap-3 space-y-0">
              <Bell className="mt-0.5 h-5 w-5 text-teal-600" />
              <div>
                <CardTitle>Customer Notifications</CardTitle>
                <CardDescription className="mt-1">
                  Automatically email customers when their enquiry status changes.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="notificationsEnabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <FormLabel className="text-sm font-medium">Enable email notifications</FormLabel>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Requires SMTP configuration below
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {notificationsEnabled && (
                <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Wifi className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">SMTP Server Configuration</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="smtpHost" render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Host</FormLabel>
                        <FormControl><Input placeholder="smtp.gmail.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="smtpPort" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Port</FormLabel>
                        <FormControl><Input placeholder="587" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="smtpUser" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username / Email</FormLabel>
                        <FormControl><Input placeholder="you@gmail.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="smtpFrom" render={({ field }) => (
                      <FormItem>
                        <FormLabel>From Address</FormLabel>
                        <FormControl><Input placeholder="noreply@stoneworld.in" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="smtpPass" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5" />
                        SMTP Password
                        {settings?.smtpPassSet && (
                          <span className="text-xs font-normal text-green-600 ml-1">(already set — leave blank to keep)</span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={settings?.smtpPassSet ? "••••••••" : "Enter SMTP password or app password"}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="currentPassword" render={({ field }) => (
                <FormItem><FormLabel>Current Password (required to change)</FormLabel><FormControl><Input type="password" {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="newPassword" render={({ field }) => (
                <FormItem><FormLabel>New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl></FormItem>
              )} />
            </CardContent>
          </Card>

          <Button type="submit" size="lg" disabled={updateSettings.isPending}>
            {updateSettings.isPending ? "Saving..." : "Save Settings"}
          </Button>

        </form>
      </Form>
    </AdminLayout>
  );
}
