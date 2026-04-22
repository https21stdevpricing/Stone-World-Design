import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  useListEnquiries, useMarkEnquiryRead, useUpdateEnquiryStatus, getListEnquiriesQueryKey, exportEnquiries,
  type Enquiry, type ListEnquiriesAudience, type EnquiryStatus,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { format, isAfter, isBefore, startOfDay, endOfDay, parseISO } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Mail, MailOpen, MessageSquare, CheckCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  in_discussion: "In Discussion",
  quoted: "Quoted",
  closed: "Closed",
};

const STATUS_BADGE_VARIANTS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  new: "default",
  in_discussion: "secondary",
  quoted: "outline",
  closed: "destructive",
};

const REPLY_PRESETS: Record<string, string> = {
  marble: `Thank you for your enquiry about our marble collection! We carry an extensive range of Italian Carrara, Statuario, and premium Indian marble varieties in multiple finishes. Our team will contact you to understand your project requirements and arrange a sample viewing at our showroom. In the meantime, feel free to call us directly for any urgent queries.`,
  quartz: `Thank you for enquiring about our quartz surfaces! Our engineered quartz collection is perfect for kitchen countertops, bathroom vanities, and commercial applications. We offer 50+ colour variants with consistent patterns. Our expert will contact you within 24 hours with a detailed quote and sample options.`,
  tiles: `Thank you for your tiles enquiry! We carry a wide range of ceramic, porcelain, vitrified, and designer tiles in various sizes and finishes. Our team will reach out to help you choose the perfect collection for your project and provide a competitive quote.`,
  sanitaryware: `Thank you for your interest in our sanitaryware collection! We carry premium brands with wall-hung WCs, vessel basins, freestanding baths, and complete bathroom solutions. Our consultant will contact you with tailored product recommendations matching your budget and design preferences.`,
  cement: `Thank you for your cement enquiry! We supply premium Portland cement from leading brands including UltraTech, ACC, and Ambuja. Bulk pricing and site delivery are available. Our team will contact you with current pricing and logistics options.`,
  tmt: `Thank you for enquiring about our TMT bars! We supply Fe-415 and Fe-500 grade ISI-certified TMT bars suitable for residential and commercial construction. Bulk orders attract special pricing. Our team will contact you with specifications and delivery details.`,
  general: `Thank you for reaching out to Stone World! Our team has received your enquiry and will connect with you shortly to discuss your requirements in detail. We typically respond within 2–4 business hours. You are welcome to visit our showroom at Pitampura, Delhi or call us directly for an immediate response.`,
};

function getAutoPreset(enq: Enquiry): string {
  const interest = (enq.productInterest || "").toLowerCase();
  if (interest.includes("marble")) return REPLY_PRESETS.marble;
  if (interest.includes("quartz")) return REPLY_PRESETS.quartz;
  if (interest.includes("tile") || interest.includes("ceramic")) return REPLY_PRESETS.tiles;
  if (interest.includes("sanitary")) return REPLY_PRESETS.sanitaryware;
  if (interest.includes("cement")) return REPLY_PRESETS.cement;
  if (interest.includes("tmt") || interest.includes("steel") || interest.includes("bar")) return REPLY_PRESETS.tmt;
  return REPLY_PRESETS.general;
}

type ReadFilter = "all" | "read" | "unread";

export default function AdminEnquiries() {
  const [audience, setAudience] = useState<ListEnquiriesAudience>("all");
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [exporting, setExporting] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [notesText, setNotesText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const queryClient = useQueryClient();
  const { data, isLoading } = useListEnquiries({
    audience: audience === "all" ? undefined : audience,
    limit: 200
  });

  const markRead = useMarkEnquiryRead();
  const updateStatus = useUpdateEnquiryStatus();

  const handleRowClick = (enq: Enquiry) => {
    setSelectedEnquiry(enq);
    setReplyText((enq as unknown as { adminReply?: string }).adminReply || "");
    setNotesText((enq as unknown as { adminNotes?: string }).adminNotes || "");
    setSendSuccess(false);
  };

  const toggleReadStatus = (enq: Enquiry, e: React.MouseEvent) => {
    e.stopPropagation();
    markRead.mutate({ id: enq.id, data: { isRead: !enq.isRead } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEnquiriesQueryKey() });
        if (selectedEnquiry?.id === enq.id) {
          setSelectedEnquiry({ ...selectedEnquiry, isRead: !enq.isRead });
        }
      }
    });
  };

  const handleStatusChange = (enq: Enquiry, newStatus: string) => {
    updateStatus.mutate({ id: enq.id, data: { status: newStatus as EnquiryStatus } }, {
      onSuccess: (updated: Enquiry) => {
        queryClient.invalidateQueries({ queryKey: getListEnquiriesQueryKey() });
        if (selectedEnquiry?.id === enq.id) {
          setSelectedEnquiry({ ...selectedEnquiry, status: updated.status });
        }
      }
    });
  };

  const handleSendReply = async (sendEmail: boolean) => {
    if (!selectedEnquiry) return;
    setSending(true);
    setSendSuccess(false);
    try {
      const response = await fetch(`/api/enquiries/${selectedEnquiry.id}/reply`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reply: replyText || undefined,
          notes: notesText || undefined,
          sendEmail,
        }),
      });
      if (response.ok) {
        setSendSuccess(true);
        queryClient.invalidateQueries({ queryKey: getListEnquiriesQueryKey() });
        setTimeout(() => setSendSuccess(false), 3000);
      }
    } catch (e) {
      console.error("Reply failed", e);
    } finally {
      setSending(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const csvData = await exportEnquiries(audience === "all" ? undefined : { audience });
      const blob = new Blob([csvData as unknown as BlobPart], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `enquiries-${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error("Export failed", e);
    } finally {
      setExporting(false);
    }
  };

  const filteredEnquiries = (data?.enquiries ?? []).filter((enq) => {
    if (readFilter === "read" && !enq.isRead) return false;
    if (readFilter === "unread" && enq.isRead) return false;
    if (dateFrom) {
      try {
        if (isBefore(parseISO(enq.createdAt), startOfDay(parseISO(dateFrom)))) return false;
      } catch { /* ignore */ }
    }
    if (dateTo) {
      try {
        if (isAfter(parseISO(enq.createdAt), endOfDay(parseISO(dateTo)))) return false;
      } catch { /* ignore */ }
    }
    return true;
  });

  const unreadCount = data?.unread ?? 0;

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif" data-testid="admin-enquiries-title">Enquiries</h1>
          <p className="text-muted-foreground text-sm">
            {unreadCount > 0 && <span className="text-primary font-medium">{unreadCount} unread &middot; </span>}
            {data?.total ?? 0} total
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting} data-testid="button-export-csv">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Select value={audience} onValueChange={(v) => setAudience(v as ListEnquiriesAudience)}>
          <SelectTrigger className="w-40 h-9 text-sm" data-testid="select-audience-filter">
            <SelectValue placeholder="All Profiles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Profiles</SelectItem>
            <SelectItem value="homeowner">Homeowner</SelectItem>
            <SelectItem value="contractor">Contractor</SelectItem>
            <SelectItem value="architect">Architect</SelectItem>
            <SelectItem value="developer">Developer</SelectItem>
          </SelectContent>
        </Select>

        <Select value={readFilter} onValueChange={(v) => setReadFilter(v as ReadFilter)}>
          <SelectTrigger className="w-36 h-9 text-sm" data-testid="select-read-filter">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="unread">Unread Only</SelectItem>
            <SelectItem value="read">Read Only</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">From</span>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-36 h-9 text-sm" data-testid="input-date-from" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">To</span>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-36 h-9 text-sm" data-testid="input-date-to" />
        </div>
        {(dateFrom || dateTo || readFilter !== "all" || audience !== "all") && (
          <Button variant="ghost" size="sm" className="h-9" onClick={() => { setDateFrom(""); setDateTo(""); setReadFilter("all"); setAudience("all"); }}>
            Clear
          </Button>
        )}
      </div>

      <div className="bg-card rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead className="whitespace-nowrap">Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Profile</TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>
              <TableHead className="hidden lg:table-cell">Interest</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Read</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filteredEnquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                  No enquiries match the current filters.
                </TableCell>
              </TableRow>
            ) : filteredEnquiries.map((enq) => (
              <TableRow
                key={enq.id}
                className={`cursor-pointer hover:bg-muted/50 ${!enq.isRead ? "bg-primary/5" : ""}`}
                onClick={() => handleRowClick(enq)}
                data-testid={`row-enquiry-${enq.id}`}
              >
                <TableCell>
                  <span className={`flex h-2 w-2 rounded-full ${!enq.isRead ? "bg-primary" : "bg-muted-foreground/30"}`} />
                </TableCell>
                <TableCell className={`whitespace-nowrap text-sm ${!enq.isRead ? "font-medium" : ""}`}>
                  {format(parseISO(enq.createdAt), "MMM d, yy")}
                </TableCell>
                <TableCell className={`text-sm ${!enq.isRead ? "font-medium" : ""}`}>{enq.name}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="outline" className="capitalize text-xs">{enq.audience}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm">{enq.phone}</TableCell>
                <TableCell className="hidden lg:table-cell truncate max-w-[140px] text-muted-foreground text-sm">
                  {enq.productInterest || "-"}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_BADGE_VARIANTS[(enq.status ?? 'new') as EnquiryStatus] ?? "outline"} className="whitespace-nowrap text-xs">
                    {STATUS_LABELS[(enq.status ?? 'new') as EnquiryStatus] ?? enq.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => toggleReadStatus(enq, e)}
                    title={enq.isRead ? "Mark as Unread" : "Mark as Read"}
                    data-testid={`button-toggle-read-${enq.id}`}
                  >
                    {enq.isRead
                      ? <MailOpen className="h-4 w-4 text-muted-foreground" />
                      : <Mail className="h-4 w-4 text-primary" />}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedEnquiry} onOpenChange={(open) => { if (!open) { setSelectedEnquiry(null); setSendSuccess(false); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enquiry Details</DialogTitle>
          </DialogHeader>
          {selectedEnquiry && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="grid grid-cols-2 gap-3 flex-1">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Name / Company</p>
                    <p className="font-medium text-sm">{selectedEnquiry.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Profile</p>
                    <Badge variant="outline" className="capitalize text-xs">{selectedEnquiry.audience}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                    <p className="font-medium text-sm">{selectedEnquiry.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                    <p className="font-medium text-sm">{selectedEnquiry.email || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Location</p>
                    <p className="font-medium text-sm">{selectedEnquiry.location || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Date</p>
                    <p className="font-medium text-sm">{format(parseISO(selectedEnquiry.createdAt), "PPpp")}</p>
                  </div>
                  {selectedEnquiry.referenceNumber && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground mb-0.5">Reference Number</p>
                      <p className="font-mono font-medium text-sm">{selectedEnquiry.referenceNumber}</p>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => toggleReadStatus(selectedEnquiry, e)}
                  className="shrink-0"
                  data-testid="button-detail-toggle-read"
                >
                  {selectedEnquiry.isRead
                    ? <><MailOpen className="mr-2 h-4 w-4" /> Mark Unread</>
                    : <><Mail className="mr-2 h-4 w-4" /> Mark Read</>}
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-muted-foreground whitespace-nowrap">Status:</p>
                <Select
                  value={selectedEnquiry.status}
                  onValueChange={(val) => handleStatusChange(selectedEnquiry, val)}
                >
                  <SelectTrigger className="w-44 h-8 text-sm" data-testid="select-enquiry-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant={STATUS_BADGE_VARIANTS[(selectedEnquiry.status ?? 'new') as EnquiryStatus] ?? "outline"} className="text-xs">
                  {STATUS_LABELS[(selectedEnquiry.status ?? 'new') as EnquiryStatus] ?? selectedEnquiry.status}
                </Badge>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Project Type / Scale</p>
                    <p className="font-medium text-sm">{selectedEnquiry.projectType || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Budget</p>
                    <p className="font-medium text-sm">{selectedEnquiry.budget || "-"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Product Interest</p>
                  <p className="font-medium text-sm">{selectedEnquiry.productInterest || "-"}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Customer Message</p>
                <p className="whitespace-pre-wrap border p-4 rounded-lg bg-card text-sm">{selectedEnquiry.message}</p>
              </div>

              {/* ── Admin Reply Section ── */}
              <div className="border rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm font-semibold">Reply to Customer</p>
                  {sendSuccess && (
                    <div className="flex items-center gap-1.5 ml-auto text-emerald-600 text-xs font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" /> Saved successfully
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-3.5">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Quick Presets</p>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setReplyText(getAutoPreset(selectedEnquiry))}
                        className="px-2.5 py-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-colors"
                      >
                        Auto (Smart)
                      </button>
                      {[
                        { key: "general", label: "General Follow Up" },
                        { key: "marble", label: "Marble" },
                        { key: "quartz", label: "Quartz" },
                        { key: "tiles", label: "Tiles" },
                        { key: "sanitaryware", label: "Sanitaryware" },
                        { key: "tmt", label: "TMT / Steel" },
                        { key: "cement", label: "Cement" },
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => setReplyText(REPLY_PRESETS[key])}
                          className="px-2.5 py-1 rounded-md bg-muted hover:bg-accent text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Reply Message {selectedEnquiry.email && <span className="text-emerald-600">(can be emailed to {selectedEnquiry.email})</span>}</p>
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply to the customer..."
                      className="min-h-[110px] text-sm resize-none"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Internal Notes <span className="text-muted-foreground/60">(private, not sent)</span></p>
                    <Textarea
                      value={notesText}
                      onChange={(e) => setNotesText(e.target.value)}
                      placeholder="Private notes for your team..."
                      className="min-h-[60px] text-sm resize-none"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-0.5">
                    <Button
                      size="sm"
                      onClick={() => handleSendReply(false)}
                      disabled={sending || (!replyText.trim() && !notesText.trim())}
                      variant="outline"
                    >
                      {sending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                      Save Notes
                    </Button>
                    {selectedEnquiry.email && (
                      <Button
                        size="sm"
                        onClick={() => handleSendReply(true)}
                        disabled={sending || !replyText.trim()}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {sending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Mail className="mr-1.5 h-3.5 w-3.5" />}
                        Send via Email
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
