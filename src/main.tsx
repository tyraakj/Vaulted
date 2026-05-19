import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
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

interface ProtectedRouteProps {
  isConnected: boolean;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  isConnected,
  children,
}) => {
  return isConnected ? <>{children}</> : <Navigate to="/" replace />;
};

export const App: React.FC = () => {
  const { address, isConnected, connect, disconnect } = useWallet();
  const { role, switchRole, initializeRole } = useRole();

  useEffect(() => {
    initializeRole();
  }, []);

  return (
    <Router>
      <div className="app">
        <NavBar isConnected={isConnected} onConnect={connect} />
        <div className="app-header">
          <WalletConnect
            address={address}
            isConnected={isConnected}
            onConnect={connect}
            onDisconnect={disconnect}
          />
          {isConnected && (
            <RoleSelect currentRole={role as any} onRoleChange={switchRole} />
          )}
        </div>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/post-job"
              element={
                <ProtectedRoute isConnected={isConnected}>
                  <PostJob />
                </ProtectedRoute>
              }
            />
            <Route path="/jobs" element={<BrowseJobs />} />
            <Route
              path="/job/:jobId"
              element={
                <ProtectedRoute isConnected={isConnected}>
                  <JobDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute isConnected={isConnected}>
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
