import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Dashboard } from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { DayPickerProvider } from 'react-day-picker';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <DayPickerProvider
        initialProps={{
          mode: 'single',
          fromYear: 1900,
          toYear: 2030
        }}
      >
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <HashRouter>
            <Routes>
              <Route path="/*" element={<Dashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </HashRouter>
        </TooltipProvider>
      </DayPickerProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;