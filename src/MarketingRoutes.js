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
import QuestionManagement_Feature from './pages/marketing/Features_QuestionManagement';
import BusinessIntelligence_Feature from './pages/marketing/Features_BusinessIntelligence';
import BlogPage from './pages/marketing/BlogPage';
import BlogPost from './pages/marketing/BlogPost';

import RestaurantSolution from './pages/marketing/solutions/RestaurantSolution';

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
      <Route path="/features/question-management" element={<QuestionManagement_Feature />} />
      <Route path="/features/business-intelligence" element={<BusinessIntelligence_Feature />} />

      {/* 📝 Blog Pages */}
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogPost />} />

      {/* 🏢 Solutions Pages */}
      <Route path="/solutions/restaurants" element={<RestaurantSolution />} />

    </Routes>
  );
};

export default MarketingRoutes;