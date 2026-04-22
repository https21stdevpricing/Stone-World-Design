import { AdminLayout } from "@/components/admin/AdminLayout";
import { useGetDashboardStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Inbox, FileText, LayoutGrid } from "lucide-react";
import { format } from "date-fns";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();

  if (isLoading || !stats) {
    return <AdminLayout><div>Loading dashboard...</div></AdminLayout>;
  }

  const statCards = [
    { title: "Total Products", value: stats.totalProducts, sub: `${stats.availableProducts} available`, icon: Package },
    { title: "Total Enquiries", value: stats.totalEnquiries, sub: `${stats.unreadEnquiries} unread`, icon: Inbox },
    { title: "Blog Posts", value: stats.totalBlogPosts, sub: `${stats.publishedBlogPosts} published`, icon: FileText },
    { title: "Categories", value: stats.totalCategories, sub: `${stats.totalMedia} media files`, icon: LayoutGrid },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-serif">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your store's performance.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Enquiries */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Enquiries</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentEnquiries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent enquiries.</p>
              ) : (
                <div className="space-y-4">
                  {stats.recentEnquiries.map((enq) => (
                    <div key={enq.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium text-sm flex items-center gap-2">
                          {enq.name}
                          {!enq.isRead && <span className="w-2 h-2 rounded-full bg-primary" />}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">{enq.audience} • {enq.phone}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(enq.createdAt), "MMM d")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions (placeholder for chart/actions) */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
               <p className="text-sm text-muted-foreground">Manage your content using the sidebar.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
