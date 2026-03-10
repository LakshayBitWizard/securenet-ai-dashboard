import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import TrafficAnalysis from "./pages/TrafficAnalysis";
import UploadDetect from "./pages/UploadDetect";
import ThreatLogs from "./pages/ThreatLogs";
import ModelSecurity from "./pages/ModelSecurity";
import AdversarialDetection from "./pages/AdversarialDetection";
import ModelIntegrity from "./pages/ModelIntegrity";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/traffic-analysis" element={<TrafficAnalysis />} />
            <Route path="/upload-detect" element={<UploadDetect />} />
            <Route path="/threat-logs" element={<ThreatLogs />} />
            <Route path="/model-security" element={<ModelSecurity />} />
            <Route path="/adversarial-detection" element={<AdversarialDetection />} />
            <Route path="/model-integrity" element={<ModelIntegrity />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
