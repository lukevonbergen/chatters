import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import RootRedirector from './pages/RootRedirector'; // optional after this change
import ManageQuestions from './pages/ManageQuestions';
import Floorplan from './pages/Floorplan';
import TablesDashboard from './pages/Dashboard_Tables'; // use this as Overview if you don’t have DashboardPage
// import DashboardPage from './pages/DashboardPage'; // if you prefer this as Overview instead
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
import RequireMasterUser from './components/RequireMasterUser';

import CustomerFeedbackPage from './pages/CustomerFeedback';

import TestDashboardPage from './pages/admin/TestDashboardPage';

const DashboardRoutes = () => {
  return (
    <VenueProvider>
      <Routes>
        {/* ✅ Make root redirect into dashboard home */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 🔐 Auth Pages (not wrapped in DashboardFrame) */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/set-password" element={<SetPasswordPage />} />

        {/* 🎛 Dashboard Home (Overview) — keep it inside DashboardFrame */}
        <Route
          path="/dashboard"
          element={
            <DashboardFrame>
              <TablesDashboard /> 
              {/* or <DashboardPage /> if that’s your Overview */}
            </DashboardFrame>
          }
        />

        {/* 🎛 Venue Dashboard Pages (all wrapped in DashboardFrame) */}
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

        {/* ✍️ Public Feedback Form (not in DashboardFrame) */}
        <Route path="/feedback" element={<CustomerFeedbackPage />} />
        <Route path="/feedback/:venueId" element={<CustomerFeedbackPage />} />

        {/* TESTING URLS */}
        <Route path="/lvb" element={<TestDashboardPage />} />

        {/* Optional: catch-all to dashboard or 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        <Route path="/overview" element={<Navigate to="/dashboard" replace />} />
        <Route path="/home" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </VenueProvider>
  );
};

export default DashboardRoutes;
