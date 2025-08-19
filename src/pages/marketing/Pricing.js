import React from 'react';
import { Helmet } from 'react-helmet';
import { Bell, CheckCircle, BarChart3, Shield, Zap, Check } from 'lucide-react';
import Navbar from '../../components/marketing/layout/Navbar';
import PageHeader from '../../components/marketing/common/sections/PageHeader';
import PricingSection from '../../components/marketing/common/sections/PricingSection';
import FAQSection from '../../components/marketing/common/sections/FAQSection';
import Footer from '../../components/marketing/layout/Footer';

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Pricing | Chatters - Real-Time Guest Feedback Software</title>
        <meta
          name="description"
          content="Discover Chatters pricing and flexible plans tailored to your venue. Get real-time guest feedback, instant staff alerts, and boost 5-star reviews with Chatters."
        />
        <meta
          name="keywords"
          content="Chatters pricing, hospitality feedback software cost, guest feedback software, prevent bad reviews, customer feedback tool, venue experience platform"
        />
        <meta property="og:title" content="Chatters Pricing | Real-Time Feedback for Hospitality" />
        <meta 
          property="og:description" 
          content="See how Chatters can fit your venue. Flexible plans with everything you need to capture feedback, resolve issues instantly, and delight guests." 
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://getchatters.com/pricing" />
      </Helmet>


      {/* Overlay navbar sits above the hero */}
      <Navbar overlay />

      <PageHeader
        title="Simple, Transparent Pricing Built for Growth"
        description="Get everything you need to capture real-time feedback, empower your staff, and delight your guests — all with flexible plans that scale with you."
        backgroundGradient="from-white to-green-100"
        showSubtitle={true}
        subtitle="Pricing"
      />

      <PricingSection
        eyebrow="Pricing"
        title="Flexible plans that scale with you"
        subtitle="Tell us about your venues and goals — we’ll tailor a plan to fit."
        buttonText="Speak to Sales"
        buttonLink="/demo"
        gradientDirection="bg-gradient-to-b"
        backgroundGradient="from-white via-white to-purple-50"
        dottedBackground
        orbGlow={true}     // set true if you want the glow
        wavyTop={false}
        wavyBottom          // fade nicely into next white section
        features={[
          "Unlimited guest feedback",
          "Instant staff alerts",
          "Multi-location reporting",
          "Role-based access & permissions",
          "Google & TripAdvisor routing",
          "Analytics & insights",
          "Custom branding",
          "Dedicated support"
        ]}
      />


       <FAQSection
        eyebrow="Pricing FAQ"
        title="Recent questions about pricing"
        description="If you have a different question, contact us and we'll help."
        dottedBackground
        wavyBottom = {false}
        backgroundGradient="from-green via-white to-blue-50"
        gradientDirection="bg-gradient-to-b"
        defaultOpenIndex={0}
        faqs={[
          { 
            q: "Do you publish your pricing?", 
            a: "No — because every venue operates differently. We tailor pricing based on your number of locations, guest volume, and specific needs." 
          },
          { 
            q: "Is there a minimum contract?", 
            a: "We offer flexible plans. Most venues choose annual billing for the best value, but monthly options are available too." 
          },
          { 
            q: "Do you charge per location or per staff member?", 
            a: "Pricing is based on your venues, not per staff user. You can add unlimited staff without extra cost." 
          },
          { 
            q: "What’s included in the subscription?", 
            a: "All plans include unlimited feedback, instant alerts, analytics, custom branding, and review routing — no hidden fees." 
          },
          { 
            q: "Can we scale up later?", 
            a: "Yes. Start with a single venue and add more locations anytime. Your pricing adjusts seamlessly as you grow." 
          },
          { 
            q: "Do you offer trials?", 
            a: "Yes — new accounts start with a free 14-day trial so you can experience Chatters before committing." 
          }
        ]}
      />


      <Footer />
    </div>
  );
};

export default PricingPage;