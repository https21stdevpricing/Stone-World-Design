import { ReactNode, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useGetAdminSession, useAdminLogout } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Package, FileText, Inbox, Tags, Image as ImageIcon, Settings, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/enquiries", label: "Enquiries", icon: Inbox },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: session, isLoading, isError } = useGetAdminSession();
  const logout = useAdminLogout();

  useEffect(() => {
    if (!isLoading && (!session?.authenticated || isError)) {
      setLocation("/admin/login");
    }
  }, [session, isLoading, isError, setLocation]);

  if (isLoading || !session?.authenticated) {
    return <div className="min-h-screen bg-muted/20 flex items-center justify-center">Loading...</div>;
  }

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => {
        window.localStorage.removeItem("sw-admin-token");
        window.location.href = "/admin/login";
      }
    });
  };

  return (
    <div className="min-h-screen bg-muted/20 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r flex-shrink-0 flex flex-col hidden md:flex">
        <div className="h-20 flex items-center px-6 border-b">
          <img src="/sw-logo.png" alt="Stone World" className="h-8 invert dark:invert-0" />
        </div>
        <div className="flex-1 py-6 px-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <Button variant={isActive ? "secondary" : "ghost"} className="w-full justify-start">
                  <Icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={handleLogout}>
            <LogOut className="mr-3 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-card border-b flex items-center px-8 md:hidden">
          <img src="/sw-logo.png" alt="Stone World" className="h-8 invert dark:invert-0" />
          {/* Mobile nav could go here */}
        </header>
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
