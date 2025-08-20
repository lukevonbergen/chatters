import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Auth
import SignInPage from './pages/auth/SignIn';
import SignUpPage from './pages/auth/SignUp';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import SetPasswordPage from './pages/auth/set-password';

// Venue‑aware app pages
import DashboardPage from './pages/dashboard/Dashboard';
import ManageQuestions from './pages/dashboard/ManageQuestions';
import Floorplan from './pages/dashboard/Floorplan';
import TablesDashboard from './pages/dashboard/Dashboard_Tables';
import SettingsPage from './pages/dashboard/SettingsPage';
import TemplatesPage from './pages/dashboard/QRTemplates';
import ReportsPage from './pages/dashboard/ReportsPage';
import Settings_Staff from './pages/dashboard/settings_staff';
import StaffLeaderboard from './pages/dashboard/Staff_Leaderboard';
import BillingPage from './pages/dashboard/Billing';
import FeedbackFeed from './pages/dashboard/FeedbackFeed';

// Kiosk (venue‑aware, no dashboard frame)
import KioskPage from './pages/dashboard/KioskPage';

// Public / guest routes (no venue context)
import CustomerFeedbackPage from './pages/dashboard/CustomerFeedback';

// Testing (outside venue context unless you need it)
import TestDashboardPage from './pages/admin/TestDashboardPage';

// Frames & context
import DashboardFrame from './pages/dashboard/DashboardFrame';
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
      {/* <Route path="/signup" element={<SignUpPage />} /> */}
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
