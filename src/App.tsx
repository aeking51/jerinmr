import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Lazy load all pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminVisitors = lazy(() => import("./pages/AdminVisitors"));
const AdminArticles = lazy(() => import("./pages/AdminArticles"));
const AdminSiteInfo = lazy(() => import("./pages/AdminSiteInfo"));
const AdminQuickLinks = lazy(() => import("./pages/AdminQuickLinks"));
const AdminProfile = lazy(() => import("./pages/AdminProfile"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Article = lazy(() => import("./pages/Article"));
const AdminShortLinks = lazy(() => import("./pages/AdminShortLinks"));
const ShortLinkRedirect = lazy(() => import("./pages/ShortLinkRedirect"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes  
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="font-mono text-primary animate-pulse">Loading...</div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/article/*" element={<Article />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/visitors" element={<AdminVisitors />} />
            <Route path="/admin/articles" element={<AdminArticles />} />
            <Route path="/admin/site-info" element={<AdminSiteInfo />} />
            <Route path="/admin/quick-links" element={<AdminQuickLinks />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
