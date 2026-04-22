import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useListEnquiries, useMarkEnquiryRead, getListEnquiriesQueryKey, useExportEnquiries } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Mail } from "lucide-react";
import { ListEnquiriesAudience } from "@workspace/api-client-react";

export default function AdminEnquiries() {
  const [audience, setAudience] = useState<ListEnquiriesAudience>("all");
  const [selectedEnquiry, setSelectedEnquiry] = useState<any | null>(null);
  
  const queryClient = useQueryClient();
  const { data, isLoading } = useListEnquiries({ 
    audience: audience === "all" ? undefined : audience,
    limit: 100 
  });
  
  const markRead = useMarkEnquiryRead();
  const exportEnq = useExportEnquiries();

  const handleRowClick = (enq: any) => {
    setSelectedEnquiry(enq);
    if (!enq.isRead) {
      markRead.mutate({ id: enq.id, data: { isRead: true } }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListEnquiriesQueryKey() })
      });
    }
  };

  const handleExport = async () => {
    try {
      const csvData = await exportEnq.mutateAsync({ audience: audience === "all" ? undefined : audience } as any);
      const blob = new Blob([csvData as unknown as BlobPart], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `enquiries-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error("Export failed", e);
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif">Enquiries</h1>
          <p className="text-muted-foreground">Manage customer messages.</p>
        </div>
        <div className="flex gap-4">
          <Select value={audience} onValueChange={(v) => setAudience(v as ListEnquiriesAudience)}>
            <SelectTrigger className="w-48"><SelectValue placeholder="All Profiles" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Profiles</SelectItem>
              <SelectItem value="homeowner">Homeowner</SelectItem>
              <SelectItem value="contractor">Contractor</SelectItem>
              <SelectItem value="architect">Architect</SelectItem>
              <SelectItem value="developer">Developer</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport} disabled={exportEnq.isPending}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Profile</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Interest</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
            ) : data?.enquiries.map((enq) => (
              <TableRow 
                key={enq.id} 
                className={`cursor-pointer hover:bg-muted/50 ${!enq.isRead ? 'bg-primary/5 font-medium' : ''}`}
                onClick={() => handleRowClick(enq)}
              >
                <TableCell>
                  {!enq.isRead ? <span className="flex h-2 w-2 rounded-full bg-primary" /> : <span className="flex h-2 w-2 rounded-full bg-muted-foreground" />}
                </TableCell>
                <TableCell>{format(new Date(enq.createdAt), "MMM d, yyyy")}</TableCell>
                <TableCell>{enq.name}</TableCell>
                <TableCell className="capitalize">{enq.audience}</TableCell>
                <TableCell>{enq.phone}</TableCell>
                <TableCell className="truncate max-w-[200px]">{enq.productInterest || '-'}</TableCell>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name / Company</p>
                  <p className="font-medium">{selectedEnquiry.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Profile</p>
                  <p className="font-medium capitalize">{selectedEnquiry.audience}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedEnquiry.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedEnquiry.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{selectedEnquiry.location || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{format(new Date(selectedEnquiry.createdAt), "PPpp")}</p>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Project Type / Scale</p>
                    <p className="font-medium">{selectedEnquiry.projectType || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="font-medium">{selectedEnquiry.budget || '-'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Product Interest</p>
                  <p className="font-medium">{selectedEnquiry.productInterest || '-'}</p>
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
