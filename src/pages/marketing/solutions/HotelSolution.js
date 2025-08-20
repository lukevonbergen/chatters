import React from 'react';
import { Helmet } from 'react-helmet';
import { Bell, CheckCircle, BarChart3, Shield, Zap, Check } from 'lucide-react';
import Navbar from '../../../components/marketing/layout/Navbar';
import PageHeader from '../../../components/marketing/common/sections/PageHeader';
import ContentSplit from '../../../components/marketing/common/sections/ContentSplit';
import FeatureGrid from '../../../components/marketing/common/sections/FeatureGrid';
import FAQSection from '../../../components/marketing/common/sections/FAQSection';
import CTA from '../../../components/marketing/common/sections/CTA';
import Footer from '../../../components/marketing/layout/Footer';

const HotelSolution = () => {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Hotel Feedback Management | Chatters - Enhance Guest Satisfaction</title>
        <meta
          name="description"
          content="Transform your hotel's guest experience with Chatters. Get instant feedback, prevent negative reviews, and improve service quality with real-time alerts and analytics."
        />
        <meta
          name="keywords"
          content="hotel feedback software, prevent negative reviews, guest satisfaction, hotel management, real-time alerts, hospitality experience"
        />
        <meta property="og:title" content="Hotel Feedback Management | Chatters" />
        <meta property="og:description" content="Get instant guest feedback and prevent negative reviews with Chatters hotel feedback management platform." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://getchatters.com/solutions/hotels" />
      </Helmet>

      {/* Overlay navbar sits above the hero */}
      <Navbar overlay />

      <PageHeader
        title="Hotel Guest Experience Management That Prevents Bad Reviews"
        description="Give your hotel the power to address guest concerns in real-time. Transform complaints into exceptional service moments and build lasting guest loyalty."
        backgroundGradient="from-white to-blue-200"
        showSubtitle={true}
        subtitle="Hotel Solutions"
      />

      <ContentSplit
        eyebrow="Built for Hotels"
        eyebrowColour = "text-blue-600/80"
        title="Address guest issues before they impact your reputation."
        description="From housekeeping concerns to front desk issues, Chatters helps your hotel team resolve problems while guests are still on property. Turn problems into praise."
        bullets={[
          "In-room feedback systems",
          "Housekeeping & front desk alerts", 
          "Concierge service tracking",
          "Multi-property management"
        ]}
        primaryCta={{ label: "Start free trial", to: "/signup" }}
        secondaryCta={{ label: "Explore pricing", to: "/pricing" }}
        image={{ src: "/img/mock-dashboard.png", alt: "Hotel operations dashboard" }}
      />

      <FeatureGrid
        eyebrow="Hotel Benefits"
        eyebrowColour = "text-blue-600/80"
        title="Why hotel teams choose Chatters"
        description="From housekeeping to management, Chatters fits into your hotel workflow and helps you create exceptional guest experiences."
        gradientDirection="bg-gradient-to-b"
        backgroundGradient="from-white to-blue-50"
        dottedBackground = {true}
        orbGlow
        cols={{ base: 1, sm: 2, md: 3, lg: 3 }}
        items={[
          {
            icon: <Bell className="w-6 h-6 text-blue-600" />,
            title: "Instant housekeeping alerts",
            description:
              "Housekeeping staff get immediate notifications about room issues while guests are still checked in.",
          },
          {
            icon: <CheckCircle className="w-6 h-6 text-blue-600" />,
            title: "Guest-centric interface",
            description:
              "Simple feedback forms accessible via QR codes in rooms, lobbies, and common areas.",
          },
          {
            icon: <BarChart3 className="w-6 h-6 text-blue-600" />,
            title: "Service performance tracking",
            description:
              "Monitor response times across departments and identify service improvement opportunities.",
          },
          {
            icon: <Shield className="w-6 h-6 text-blue-600" />,
            title: "Reputation protection",
            description:
              "Resolve guest complaints before they post on TripAdvisor or Booking.com.",
          },
          {
            icon: <Zap className="w-6 h-6 text-blue-600" />,
            title: "Multi-property ready",
            description:
              "Centralized management across hotel chains with property-specific insights.",
          },
          {
            icon: <Check className="w-6 h-6 text-blue-600" />,
            title: "Build guest loyalty",
            description:
              "Turn service recoveries into memorable experiences that drive repeat bookings.",
          },
        ]}
        wavyBottom={true}
      />

      <FAQSection
        eyebrow="Hotel FAQ"
        eyebrowColour = "text-blue-600/80"
        title="Everything you need to know"
        description="If you have a different question, contact us and we'll help."
        dottedBackground
        orbGlow
        wavyBottom = {false}
        backgroundGradient="from-white via-white to-blue-50"
        gradientDirection="bg-gradient-to-b"
        defaultOpenIndex={0}
        faqs={[
          { q: "How do guests provide feedback?", a: "QR codes in rooms and common areas link to quick feedback forms. Guests can rate and comment in under a minute." },
          { q: "Can it handle multiple departments?", a: "Yes—alerts automatically route to housekeeping, front desk, maintenance, or management based on issue type." },
          { q: "Does it work for hotel chains?", a: "Absolutely. Multi-property dashboards with individual hotel insights and cross-property comparisons." },
          { q: "What about guest privacy?", a: "All feedback is handled securely with optional anonymous reporting and GDPR compliance built-in." },
        ]}
      />

      <CTA 
        title="Enhance your guest experience today" 
        subtitle="Start your free 14-day trial and turn guest concerns into service excellence."
        buttonText="Book a Demo"
        buttonLink="/demo"
        gradientDirection="bg-gradient-to-r"
        backgroundGradient="from-blue-50 via-white to-indigo-50"
      />

      <Footer />
    </div>
  );
};

export default HotelSolution;