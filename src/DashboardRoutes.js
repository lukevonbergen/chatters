// Update your DashboardRoutes.js file to include the kiosk route

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import ManageQuestions from './pages/ManageQuestions';
import Floorplan from './pages/Floorplan';
import TablesDashboard from './pages/Dashboard_Tables';
import DashboardPage from './pages/Dashboard';
import SettingsPage from './pages/SettingsPage';
import TemplatesPage from './pages/QRTemplates';
import ReportsPage from './pages/ReportsPage';
import Settings_Staff from './pages/settings_staff';
import StaffLeaderboard from './pages/Staff_Leaderboard';
import BillingPage from './pages/Billing';
import FeedbackFeed from './pages/FeedbackFeed';

// Import kiosk page
import KioskPage from './pages/KioskPage';

import SignInPage from './pages/SignIn';
import SignUpPage from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SetPasswordPage from './pages/set-password';

import { VenueProvider } from './context/VenueContext';
import DashboardFrame from './pages/DashboardFrame';

import CustomerFeedbackPage from './pages/CustomerFeedback';
import TestDashboardPage from './pages/admin/TestDashboardPage';

const DashboardRoutes = () => {
  return (
    <VenueProvider>
      <Routes>
        {/* Root → Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Auth (no frame) */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/set-password" element={<SetPasswordPage />} />

        {/* Kiosk Mode (no frame, public-style access) */}
        <Route path="/kiosk" element={<KioskPage />} />

        {/* Dashboard home (Overview) */}
        <Route
          path="/dashboard"
          element={
            <DashboardFrame>
              <DashboardPage />
            </DashboardFrame>
          }
        />

        {/* App pages (with frame) */}
        <Route path="/questions" element={<DashboardFrame><ManageQuestions /></DashboardFrame>} />
        <Route path="/floorplan" element={<DashboardFrame><Floorplan /></DashboardFrame>} />
        <Route path="/tablefeedback" element={<DashboardFrame><TablesDashboard /></DashboardFrame>} />
        <Route path="/settings" element={<DashboardFrame><SettingsPage /></DashboardFrame>} />
        <Route path="/templates" element={<DashboardFrame><TemplatesPage /></DashboardFrame>} />
        <Route path="/reports" element={<DashboardFrame><ReportsPage /></DashboardFrame>} />
        <Route path="/staff" element={<DashboardFrame><Settings_Staff /></DashboardFrame>} />
        <Route path="/staff/leaderboard" element={<DashboardFrame><StaffLeaderboard /></DashboardFrame>} />
        <Route path="/feedbackfeed" element={<DashboardFrame><FeedbackFeed /></DashboardFrame>} />
        <Route path="/settings/billing" element={<DashboardFrame><BillingPage /></DashboardFrame>} />

        {/* Public (no frame) */}
        <Route path="/feedback" element={<CustomerFeedbackPage />} />
        <Route path="/feedback/:venueId" element={<CustomerFeedbackPage />} />

        {/* Testing */}
        <Route path="/lvb" element={<TestDashboardPage />} />

        {/* Catch-alls / legacy */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        <Route path="/overview" element={<Navigate to="/dashboard" replace />} />
        <Route path="/home" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </VenueProvider>
  );
};

export default DashboardRoutes;