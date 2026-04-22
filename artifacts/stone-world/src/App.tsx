import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import About from "@/pages/About";
import Discover from "@/pages/Discover";
import ProductDetail from "@/pages/ProductDetail";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Contact from "@/pages/Contact";
import Track from "@/pages/Track";

import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminBlog from "@/pages/admin/AdminBlog";
import AdminEnquiries from "@/pages/admin/AdminEnquiries";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminMedia from "@/pages/admin/AdminMedia";
import AdminSettings from "@/pages/admin/AdminSettings";

const queryClient = new QueryClient();

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [location]);
  return null;
}

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const [location] = useLocation();
  
  return (
    <motion.div
      key={location}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col min-h-screen"
    >
      {children}
    </motion.div>
  );
};

function Router() {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Switch location={location} key={location}>
        <Route path="/" component={() => <PageTransition><Home /></PageTransition>} />
        <Route path="/about" component={() => <PageTransition><About /></PageTransition>} />
        <Route path="/discover" component={() => <PageTransition><Discover /></PageTransition>} />
        <Route path="/discover/:id" component={() => <PageTransition><ProductDetail /></PageTransition>} />
        <Route path="/blog" component={() => <PageTransition><Blog /></PageTransition>} />
        <Route path="/blog/:slug" component={() => <PageTransition><BlogPost /></PageTransition>} />
        <Route path="/contact" component={() => <PageTransition><Contact /></PageTransition>} />
        <Route path="/track" component={() => <PageTransition><Track /></PageTransition>} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/admin/products" component={AdminProducts} />
        <Route path="/admin/blog" component={AdminBlog} />
        <Route path="/admin/enquiries" component={AdminEnquiries} />
        <Route path="/admin/categories" component={AdminCategories} />
        <Route path="/admin/media" component={AdminMedia} />
        <Route path="/admin/settings" component={AdminSettings} />

        <Route component={() => <PageTransition><NotFound /></PageTransition>} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <ScrollToTop />
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
