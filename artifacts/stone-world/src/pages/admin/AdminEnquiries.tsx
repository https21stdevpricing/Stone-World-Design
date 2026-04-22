import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  useListEnquiries, useMarkEnquiryRead, useUpdateEnquiryStatus, getListEnquiriesQueryKey, exportEnquiries,
  type Enquiry, type ListEnquiriesAudience, type EnquiryStatus, EnquiryStatus as EnquiryStatusEnum,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { format, isAfter, isBefore, startOfDay, endOfDay, parseISO } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Mail, MailOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

type ReadFilter = "all" | "read" | "unread";

export default function AdminEnquiries() {
  const [audience, setAudience] = useState<ListEnquiriesAudience>("all");
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [exporting, setExporting] = useState(false);

  const queryClient = useQueryClient();
  const { data, isLoading } = useListEnquiries({
    audience: audience === "all" ? undefined : audience,
    limit: 200
  });

  const markRead = useMarkEnquiryRead();
  const updateStatus = useUpdateEnquiryStatus();

  const handleRowClick = (enq: Enquiry) => {
    setSelectedEnquiry(enq);
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
      onSuccess: (updated) => {
        queryClient.invalidateQueries({ queryKey: getListEnquiriesQueryKey() });
        if (selectedEnquiry?.id === enq.id) {
          setSelectedEnquiry({ ...selectedEnquiry, status: updated.status });
        }
      }
    });
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
      } catch { /* ignore parse errors */ }
    }
    if (dateTo) {
      try {
        if (isAfter(parseISO(enq.createdAt), endOfDay(parseISO(dateTo)))) return false;
      } catch { /* ignore parse errors */ }
    }
    return true;
  });

  const unreadCount = data?.unread ?? 0;

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-serif" data-testid="admin-enquiries-title">Enquiries</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 && <span className="text-primary font-medium">{unreadCount} unread &middot; </span>}
            {data?.total ?? 0} total
          </p>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={exporting} data-testid="button-export-csv">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <Select value={audience} onValueChange={(v) => setAudience(v as ListEnquiriesAudience)}>
          <SelectTrigger className="w-44" data-testid="select-audience-filter"><SelectValue placeholder="All Profiles" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Profiles</SelectItem>
            <SelectItem value="homeowner">Homeowner</SelectItem>
            <SelectItem value="contractor">Contractor</SelectItem>
            <SelectItem value="architect">Architect</SelectItem>
            <SelectItem value="developer">Developer</SelectItem>
          </SelectContent>
        </Select>

        <Select value={readFilter} onValueChange={(v) => setReadFilter(v as ReadFilter)}>
          <SelectTrigger className="w-40" data-testid="select-read-filter"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="unread">Unread Only</SelectItem>
            <SelectItem value="read">Read Only</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">From</span>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-40"
            data-testid="input-date-from"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">To</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-40"
            data-testid="input-date-to"
          />
        </div>
        {(dateFrom || dateTo || readFilter !== "all" || audience !== "all") && (
          <Button variant="ghost" size="sm" onClick={() => { setDateFrom(""); setDateTo(""); setReadFilter("all"); setAudience("all"); }}>
            Clear Filters
          </Button>
        )}
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Profile</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Interest</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Read</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={8} className="text-center">Loading...</TableCell></TableRow>
            ) : filteredEnquiries.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No enquiries match the current filters.</TableCell></TableRow>
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
                <TableCell className={!enq.isRead ? "font-medium" : ""}>{format(parseISO(enq.createdAt), "MMM d, yyyy")}</TableCell>
                <TableCell className={!enq.isRead ? "font-medium" : ""}>{enq.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">{enq.audience}</Badge>
                </TableCell>
                <TableCell>{enq.phone}</TableCell>
                <TableCell className="truncate max-w-[150px] text-muted-foreground text-sm">{enq.productInterest || "-"}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_BADGE_VARIANTS[enq.status] ?? "outline"} className="whitespace-nowrap">
                    {STATUS_LABELS[enq.status] ?? enq.status}
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
                    {enq.isRead ? <MailOpen className="h-4 w-4 text-muted-foreground" /> : <Mail className="h-4 w-4 text-primary" />}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedEnquiry} onOpenChange={(open) => !open && setSelectedEnquiry(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enquiry Details</DialogTitle>
          </DialogHeader>
          {selectedEnquiry && (
            <div className="space-y-6">
              <div className="flex justify-between items-start gap-4">
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <div>
                    <p className="text-sm text-muted-foreground">Name / Company</p>
                    <p className="font-medium">{selectedEnquiry.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Profile</p>
                    <Badge variant="outline" className="capitalize">{selectedEnquiry.audience}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedEnquiry.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedEnquiry.email || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{selectedEnquiry.location || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{format(parseISO(selectedEnquiry.createdAt), "PPpp")}</p>
                  </div>
                  {selectedEnquiry.referenceNumber && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Reference Number</p>
                      <p className="font-mono font-medium">{selectedEnquiry.referenceNumber}</p>
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
                  {selectedEnquiry.isRead ? <><MailOpen className="mr-2 h-4 w-4" /> Mark Unread</> : <><Mail className="mr-2 h-4 w-4" /> Mark Read</>}
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-muted-foreground whitespace-nowrap">Update Status:</p>
                <Select
                  value={selectedEnquiry.status}
                  onValueChange={(val) => handleStatusChange(selectedEnquiry, val)}
                >
                  <SelectTrigger className="w-48" data-testid="select-enquiry-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant={STATUS_BADGE_VARIANTS[selectedEnquiry.status] ?? "outline"}>
                  {STATUS_LABELS[selectedEnquiry.status] ?? selectedEnquiry.status}
                </Badge>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Project Type / Scale</p>
                    <p className="font-medium">{selectedEnquiry.projectType || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="font-medium">{selectedEnquiry.budget || "-"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Product Interest</p>
                  <p className="font-medium">{selectedEnquiry.productInterest || "-"}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Message</p>
                <p className="whitespace-pre-wrap border p-4 rounded-lg bg-card">{selectedEnquiry.message}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
