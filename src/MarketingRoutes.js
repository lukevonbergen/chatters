import React from 'react';
import { Routes, Route } from 'react-router-dom';

import LandingPage from './pages/marketing/LandingPage';
import PricingPage from './pages/marketing/Pricing';
import FeaturesPage from './pages/marketing/Features';
import ContactPage from './pages/marketing/ContactPage';
import SecurityPage from './pages/marketing/SecurityPage';
import HelpPage from './pages/marketing/HelpPage';
import TermsAndConditionsPage from './pages/marketing/Terms';
import PrivacyPolicyPage from './pages/marketing/Privacy';
import AboutPage from './pages/marketing/AboutPage';
import DemoPage from './pages/marketing/DemoPage';

import QRCodePage_Feature from './pages/marketing/Features_QRCode';
import NPS_Feature from './pages/marketing/Features_NPSScore';
import RealTimeStats_Feature from './pages/marketing/Features_RealTimeStats';
import CustomBranding_Feature from './pages/marketing/Features_CustomBranding';
import CustomQuestions_Feature from './pages/marketing/Features_CustomQuestions';
import Dashboards_Feature from './pages/marketing/Features_Dashboards';
import BlogPage from './pages/marketing/BlogPage';
import BlogPost from './pages/marketing/BlogPost';

import QuestionManagementProduct from './pages/marketing/product/QuestionManagement';
import BusinessIntelligenceProduct from './pages/marketing/product/BusinessIntelligence';
import AutomationWorkflowProduct from './pages/marketing/product/Automation-Workflows';
import MultiLocationControlProduct from './pages/marketing/product/Multi-Location-Control';
import KioskModeProduct from './pages/marketing/product/Kiosk-Mode';
import RealTimeAlertsProduct from './pages/marketing/product/Real-Time-Alerts';

import RestaurantSolution from './pages/marketing/solutions/RestaurantSolution';
import HotelSolution from './pages/marketing/solutions/HotelSolution';
import RetailSolution from './pages/marketing/solutions/RetailSolution';
import EventSolution from './pages/marketing/solutions/EventSolution';

const MarketingRoutes = () => {
  return (
    <Routes>
      {/* 🌍 Public Marketing Site */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/security" element={<SecurityPage />} />
      <Route path="/help" element={<HelpPage />} />
      <Route path="/terms" element={<TermsAndConditionsPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/demo" element={<DemoPage />} />

      {/* 🎯 Feature Deep Links */}
      <Route path="/features/qr-codes" element={<QRCodePage_Feature />} />
      <Route path="/features/nps-score" element={<NPS_Feature />} />
      <Route path="/features/real-time-stats" element={<RealTimeStats_Feature />} />
      <Route path="/features/custom-branding" element={<CustomBranding_Feature />} />
      <Route path="/features/custom-questions" element={<CustomQuestions_Feature />} />
      <Route path="/features/dashboards" element={<Dashboards_Feature />} />

      {/* 📝 Blog Pages */}
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogPost />} />

      {/* 🏢 Product Pages */}
      <Route path="/product/question-management" element={<QuestionManagementProduct />} />
      <Route path="/product/business-intelligence" element={<BusinessIntelligenceProduct />} />
      <Route path="/product/automation-workflow" element={<AutomationWorkflowProduct />} />
      <Route path="/product/multi-location-control" element={<MultiLocationControlProduct />} />
      <Route path="/product/kiosk-mode" element={<KioskModeProduct />} />
      <Route path="/product/real-time-alerts" element={<RealTimeAlertsProduct />} />

      {/* 🏢 Solutions Pages */}
      <Route path="/solutions/restaurants" element={<RestaurantSolution />} />
      <Route path="/solutions/hotels" element={<HotelSolution />} />
      <Route path="/solutions/retail" element={<RetailSolution />} />
      <Route path="/solutions/events" element={<EventSolution />} />

    </Routes>
  );
};

export default MarketingRoutes;