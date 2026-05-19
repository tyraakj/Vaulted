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
import { WalletConnect } from "./components/WalletConnect";
import { RoleSelect } from "./components/RoleSelect";
import { Home } from "./pages/Home";
import { PostJob } from "./pages/PostJob";
import { BrowseJobs } from "./pages/BrowseJobs";
import { Dashboard } from "./pages/Dashboard";
import { JobDetail } from "./pages/JobDetail";
import { ProtectedRoute } from "./components/ProtectedRoute";

interface ProtectedRouteProps {
  isConnected: boolean;
  children: React.ReactNode;
}

// Use frontend ProtectedRoute component from Layer 7

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
        <NavBar isConnected={isConnected} onConnect={connect} userRole={role} />
        <div className="app-header">
          <WalletConnect
            address={address}
            isConnected={isConnected}
            onConnect={connect}
            onDisconnect={disconnect}
          />
          {isConnected && (
            <RoleSelect currentRole={role as any} onRoleChange={saveRole} />
          )}
        </div>
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
                  userRole={role}
                >
                  <PostJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/browse"
              element={
                <ProtectedRoute
                  isConnected={isConnected}
                  isCorrectNetwork={isCorrectNetwork}
                  requiredRole="freelancer"
                  userRole={role}
                >
                  <BrowseJobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/job/:jobId"
              element={
                <ProtectedRoute
                  isConnected={isConnected}
                  isCorrectNetwork={isCorrectNetwork}
                  userRole={role}
                >
                  <JobDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute
                  isConnected={isConnected}
                  isCorrectNetwork={isCorrectNetwork}
                  userRole={role}
                >
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};
