import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Auth
import SignInPage from './pages/SignIn';
import SignUpPage from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SetPasswordPage from './pages/set-password';

// Venue‑aware app pages
import DashboardPage from './pages/Dashboard';
import ManageQuestions from './pages/ManageQuestions';
import Floorplan from './pages/Floorplan';
import TablesDashboard from './pages/Dashboard_Tables';
import SettingsPage from './pages/SettingsPage';
import TemplatesPage from './pages/QRTemplates';
import ReportsPage from './pages/ReportsPage';
import Settings_Staff from './pages/settings_staff';
import StaffLeaderboard from './pages/Staff_Leaderboard';
import BillingPage from './pages/Billing';
import FeedbackFeed from './pages/FeedbackFeed';

// Kiosk (venue‑aware, no dashboard frame)
import KioskPage from './pages/KioskPage';

// Public / guest routes (no venue context)
import CustomerFeedbackPage from './pages/CustomerFeedback';

// Testing (outside venue context unless you need it)
import TestDashboardPage from './pages/admin/TestDashboardPage';

// Frames & context
import DashboardFrame from './pages/DashboardFrame';
import { VenueProvider } from './context/VenueContext';

// Wrap all authenticated dashboard pages once: VenueProvider + DashboardFrame
const DashboardShell = () => (
  <VenueProvider>
    <DashboardFrame>
      <Outlet />
    </DashboardFrame>
  </VenueProvider>
);

// Kiosk gets VenueProvider but intentionally no DashboardFrame
const KioskShell = () => (
  <VenueProvider>
    <Outlet />
  </VenueProvider>
);

const DashboardRoutes = () => {
  return (
    <Routes>
      {/* Auth (no VenueProvider, no DashboardFrame) */}
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/set-password" element={<SetPasswordPage />} />

      {/* Public guest feedback (no venue context) */}
      <Route path="/feedback" element={<CustomerFeedbackPage />} />
      <Route path="/feedback/:venueId" element={<CustomerFeedbackPage />} />

      {/* Kiosk: venue context, no dashboard frame */}
      <Route element={<KioskShell />}>
        <Route path="/kiosk" element={<KioskPage />} />
      </Route>

      {/* Authenticated app: venue context + dashboard frame */}
      <Route element={<DashboardShell />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/questions" element={<ManageQuestions />} />
        <Route path="/floorplan" element={<Floorplan />} />
        <Route path="/tablefeedback" element={<TablesDashboard />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/staff" element={<Settings_Staff />} />
        <Route path="/staff/leaderboard" element={<StaffLeaderboard />} />
        <Route path="/feedbackfeed" element={<FeedbackFeed />} />
        <Route path="/settings/billing" element={<BillingPage />} />
      </Route>

      {/* Default / legacy */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/overview" element={<Navigate to="/dashboard" replace />} />
      <Route path="/home" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />

      {/* Testing (leave outside unless venue context needed) */}
      <Route path="/lvb" element={<TestDashboardPage />} />
    </Routes>
  );
};

export default DashboardRoutes;
