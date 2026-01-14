import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Waitlist from "./pages/Waitlist";
import ThankYou from "./pages/ThankYou";
import NotFound from "./pages/NotFound";
import DemoHome from "./pages/DemoHome";

/* NEW IMPORTS: Layout and pages for demo */
import { AppLayout } from "./components/layout/AppLayout";
import { SearchInterface } from "./components/SearchInterface";
import { PitchBuilder } from "./components/PitchBuilder";
import { MusicCatalog } from "./components/MusicCatalog";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* LANDING PAGE: Marketing page */}
          <Route path="/" element={<Landing />} />

          {/* WAITLIST: Signup form */}
          <Route path="/waitlist" element={<Waitlist />} />

          {/* THANK YOU: Post-signup confirmation */}
          <Route path="/thank-you" element={<ThankYou />} />

          {/* DEMO ROUTES: All demo pages wrapped in AppLayout (sidebar + content) */}
          <Route path="/demo" element={<Navigate to="/demo/home" replace />} />
          <Route
            path="/demo/*"
            element={
              <AppLayout>
                <Routes>
                  {/* HOME: Main search page with gradient background */}
                  <Route path="home" element={<DemoHome />} />

                  {/* SEARCH: Music search interface (new session) */}
                  <Route path="search" element={<SearchInterface />} />

                  {/* SEARCH: Resume chat session by ID */}
                  <Route path="search/:sessionId" element={<SearchInterface />} />

                  {/* PLAYLISTS: Pitch builder / folder management */}
                  <Route path="playlists" element={<PitchBuilder />} />

                  {/* DRIVE: Placeholder route using pitch builder */}
                  <Route path="drive" element={<PitchBuilder />} />

                  {/* PITCH KIT: Dedicated path for pitch kit builder */}
                  <Route path="pitch-kit" element={<PitchBuilder />} />

                  {/* CATALOG: Music catalog browser */}
                  <Route path="catalog" element={<MusicCatalog />} />
                </Routes>
              </AppLayout>
            }
          />

          {/* 404: Catch-all for unknown routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
