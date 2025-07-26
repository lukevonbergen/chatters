import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import RootRedirector from './pages/RootRedirector';
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

import SignInPage from './pages/SignIn';
import SignUpPage from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SetPasswordPage from './pages/set-password';

import { VenueProvider } from './context/VenueContext';
import DashboardFrame from './pages/DashboardFrame';

import AdminFrame from './pages/admin/AdminFrame';
import AdminDashboard from './pages/admin/AdminDashboard';

const DashboardRoutes = () => {
  return (
    <VenueProvider>
      <Routes>
        {/* Redirect for /dashboard to root */}
        <Route path="/dashboard" element={<Navigate to="/" replace />} />

        {/* 🔐 Auth Pages */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/set-password" element={<SetPasswordPage />} />

        {/* 🧭 Main redirector */}
        <Route path="/" element={<RootRedirector />} />

        {/* 🎛 Venue Dashboard Pages */}
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

      </Routes>
    </VenueProvider>
  );
};

export default DashboardRoutes;
