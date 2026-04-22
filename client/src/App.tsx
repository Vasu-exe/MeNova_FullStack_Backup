import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import CookiePolicy from "./pages/CookiePolicy";
import Accessibility from "./pages/Accessibility";
import ScheduleFollowup from "./pages/ScheduleFollowup";
import AdminDashboard from "./pages/AdminDashboard";
import PortalAuth from "./pages/PortalAuth";
import PatientPortal from "./pages/PatientPortal";
import NPPortal from "./pages/NPPortal";
import UTMTracker from "./components/UTMTracker";
import AIChatWidget from "./components/AIChatWidget";
import { useLocation } from "wouter";


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/privacy-policy"} component={PrivacyPolicy} />
      <Route path={"/terms-and-conditions"} component={TermsAndConditions} />
      <Route path={"/cookie-policy"} component={CookiePolicy} />
      <Route path={"/accessibility"} component={Accessibility} />
      <Route path={"/schedule-followup"} component={ScheduleFollowup} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/portal"} component={PortalAuth} />
      <Route path={"/patient-portal"} component={PatientPortal} />
      <Route path={"/np-portal"} component={NPPortal} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function GlobalChatWidget() {
  const [location] = useLocation();
  // Don't show chat on admin, portal, or dashboard pages
  if (location.startsWith("/admin") || location.startsWith("/patient-portal") || location.startsWith("/np-portal")) return null;
  return <AIChatWidget />;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <TooltipProvider>
          <Toaster />
          <UTMTracker />
          <Router />
          <GlobalChatWidget />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
