import { Navigate, Route, Routes } from "react-router-dom";
import "./index.css";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { NotificationProvider } from "./context/NotificationContext";
import AdminLayout from "./layouts/AdminLayout";
import AdminLoginPage from "./pages/LoginPage";
import DashboardHomePage from "./pages/DashboardPage";
import NotificationsPage from "./pages/NotificationsPage";
import PaymentsPage from "./pages/PaymentsPage";
import StudentsListPage from "./pages/StudentsListPage";
import StudentsUploadPage from "./pages/StudentsUploadPage";
import StudentDetailsPage from "./pages/StudentDetailsPage";
import ResultsPage from "./pages/ResultsPage";
import ResultsManualUploadPage from "./pages/ResultsManualUploadPage";
import ResultsBulkUploadPage from "./pages/ResultsBulkUploadPage";
import ResultViewPage from "./pages/ResultViewPage";
import TokensPage from "./pages/TokensPage";
import TokenViewPage from "./pages/TokenViewPage";
import VerificationPage from "./pages/VerificationPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import CertificatesPage from "./pages/CertificatesPage";
import LogsPage from "./pages/LogsPage";
import KnowledgeBasePage from "./pages/KnowledgeBasePage";

// Placeholder Components for routes not yet fully refactored or new
const PlaceholderPage = ({ title }) => (
  <div className="card">
    <h2 className="text-xl font-bold mb-4">{title}</h2>
    <p className="text-gray-500">This page is under construction.</p>
  </div>
);

const RequireAuth = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<AdminLoginPage />} />
      
      {/* Protected Admin Routes */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        
        {/* Dashboard */}
        <Route path="dashboard" element={<DashboardHomePage />} />
        
        {/* Students Management */}
        <Route path="students/list" element={<StudentsListPage />} />
        <Route path="students/upload" element={<StudentsUploadPage />} />
        <Route path="students/details/:id" element={<StudentDetailsPage />} />
        
        {/* Results Management */}
        <Route path="results" element={<ResultsPage />} />
        <Route path="results/upload-manual" element={<ResultsManualUploadPage />} />
        <Route path="results/upload-bulk" element={<ResultsBulkUploadPage />} />
        <Route path="results/view/:id" element={<ResultViewPage />} />
        
        {/* Token Management */}
        <Route path="tokens/list" element={<TokensPage />} />
        <Route path="tokens/generate" element={<TokensPage />} />
        <Route path="tokens/view/:id" element={<TokenViewPage />} />
        
        {/* Other Features */}
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="verification" element={<VerificationPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="certificates" element={<CertificatesPage />} />
        <Route path="chatbot-kb" element={<KnowledgeBasePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="logs" element={<LogsPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppRoutes />
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
