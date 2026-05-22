import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useWallet } from "./hooks/useWallet";
import { useRole } from "./hooks/useRole";
import { NavBar } from "./components/NavBar";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { PostJob } from "./pages/PostJob";
import { BrowseJobs } from "./pages/BrowseJobs";
import { Dashboard } from "./pages/Dashboard";
import { JobDetail } from "./pages/JobDetail";
import { Terms } from "./components/Terms";
import { Privacy } from "./components/Privacy";
import { Contact } from "./components/Contact";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const App: React.FC = () => {
  const { address, isConnected, isCorrectNetwork, connect, disconnect } =
    useWallet();
  const { role, saveRole, initializeRole } = useRole();

  useEffect(() => {
    initializeRole();
  }, []);

  return (
    <Router>
      <div className="app">
        <NavBar
          isConnected={isConnected}
          onConnect={connect}
          onDisconnect={disconnect}
          address={address}
          userRole={role}
          onRoleChange={saveRole}
        />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/post-job"
              element={
                <ProtectedRoute
                  isConnected={isConnected}
                  isCorrectNetwork={isCorrectNetwork}
                  requiredRole="client"
                >
                  <PostJob />
                </ProtectedRoute>
              }
            />
            <Route path="/browse" element={<BrowseJobs />} />
            <Route path="/job/:jobId" element={<JobDetail />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute
                  isConnected={isConnected}
                  isCorrectNetwork={isCorrectNetwork}
                >
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};
