import { useState } from "react";
import Navbar from "@/components/Navbar";
import LandingPage from "@/components/LandingPage";
import Dashboard from "@/components/Dashboard";
import Posts from "@/components/Posts";
import Support from "@/components/Support";
import Settings from "@/components/Settings";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("home");

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <LandingPage />;
      case "dashboard":
        return <Dashboard />;
      case "posts":
        return <Posts />;
      case "support":
        return <Support />;
      case "settings":
        return <Settings />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentPage={currentPage} onPageChange={setCurrentPage} />
      {renderPage()}
    </div>
  );
};

export default Index;
