import { BrowserRouter as Router, Routes, Route } from "react-router";
import Layout from "@/react-app/components/Layout";
import Dashboard from "@/react-app/pages/Dashboard";
import SystemIntegrations from "@/react-app/pages/SystemIntegrations";
import AISearch from "@/react-app/pages/AISearch";
import KnowledgeBase from "@/react-app/pages/KnowledgeBase";
import SLAManagement from "@/react-app/pages/SLAManagement";
import Analytics from "@/react-app/pages/Analytics";
import Settings from "@/react-app/pages/Settings";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/integrations" element={<SystemIntegrations />} />
          <Route path="/search" element={<AISearch />} />
          <Route path="/knowledge" element={<KnowledgeBase />} />
          <Route path="/sla" element={<SLAManagement />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}
