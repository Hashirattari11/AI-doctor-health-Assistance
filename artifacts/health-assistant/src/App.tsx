import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, ProtectedRoute } from "@/hooks/use-auth";

import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import ReportAnalyzer from "@/pages/report-analyzer";
import ImageAnalysis from "@/pages/image-analysis";
import DietPlan from "@/pages/diet-plan";
import History from "@/pages/history";
import ReportGenerator from "@/pages/report-generator";
import Settings from "@/pages/settings";

import { AppLayout } from "@/components/layout";
import { ChatWidget } from "@/components/chat-widget";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Protected Routes wrapped in AppLayout */}
      <Route path="/dashboard">
        <AppLayout><ProtectedRoute component={Dashboard} /></AppLayout>
      </Route>
      <Route path="/report-analyzer">
        <AppLayout><ProtectedRoute component={ReportAnalyzer} /></AppLayout>
      </Route>
      <Route path="/image-analysis">
        <AppLayout><ProtectedRoute component={ImageAnalysis} /></AppLayout>
      </Route>
      <Route path="/diet-plan">
        <AppLayout><ProtectedRoute component={DietPlan} /></AppLayout>
      </Route>
      <Route path="/history">
        <AppLayout><ProtectedRoute component={History} /></AppLayout>
      </Route>
      <Route path="/report-generator/:id">
        <AppLayout><ProtectedRoute component={ReportGenerator} /></AppLayout>
      </Route>
      <Route path="/settings">
        <AppLayout><ProtectedRoute component={Settings} /></AppLayout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AuthProvider>
              <AppRouter />
              <ChatWidget />
            </AuthProvider>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
