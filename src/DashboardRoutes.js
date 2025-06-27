import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import DashboardPage from './pages/Dashboard';
import ManageQuestions from './pages/ManageQuestions';
import Heatmap from './pages/Heatmap';
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

import { VenueProvider } from './context/VenueContext';
import DashboardFrame from './pages/DashboardFrame';

const DashboardRoutes = () => {
  return (
    <VenueProvider>
      <Routes>
        {/* Redirect for /dashboard to my.getchatters.com/ */}
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        {/* 🔐 Auth Pages (no DashboardFrame) */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* 🧭 Dashboard Pages (wrapped in DashboardFrame) */}
        <Route path="/" element={<DashboardFrame><DashboardPage /></DashboardFrame>} />
        <Route path="/questions" element={<DashboardFrame><ManageQuestions /></DashboardFrame>} />
        <Route path="/heatmap" element={<DashboardFrame><Heatmap /></DashboardFrame>} />
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