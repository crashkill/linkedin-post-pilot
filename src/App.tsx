import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Posts from "./pages/Posts";
import Templates from "./pages/Templates";
import Create from "./pages/Create";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import LinkedInTestPublisher from "./components/LinkedInTestPublisher";
import Layout from "./components/Layout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Páginas públicas */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Páginas protegidas */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/posts" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Posts />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/templates" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Templates />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Create />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/test-linkedin" 
            element={
              <ProtectedRoute>
                <Layout>
                  <LinkedInTestPublisher />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
