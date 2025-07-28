import React from 'react';
import { Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import PricingPage from './pages/Pricing';
import FeaturesPage from './pages/Features';
import ContactPage from './pages/ContactPage';
import SecurityPage from './pages/SecurityPage';
import TermsAndConditionsPage from './pages/Terms';
import PrivacyPolicyPage from './pages/Privacy';
import AboutPage from './pages/AboutPage';
import DemoPage from './pages/DemoPage';

import QRCodePage_Feature from './pages/Features_QRCode';
import NPS_Feature from './pages/Features_NPSScore';
import RealTimeStats_Feature from './pages/Features_RealTimeStats';
import CustomBranding_Feature from './pages/Features_CustomBranding';
import CustomQuestions_Feature from './pages/Features_CustomQuestions';
import Dashboards_Feature from './pages/Features_Dashboards';

const MarketingRoutes = () => {
  return (
    <Routes>
      {/* 🌍 Public Marketing Site */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/security" element={<SecurityPage />} />
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

    </Routes>
  );
};

export default MarketingRoutes;