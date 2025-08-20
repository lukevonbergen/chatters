import React from 'react';
import { Helmet } from 'react-helmet';
import { Tablet, Wifi, Lock, Palette, Zap, Touchpad } from 'lucide-react';
import Navbar from '../../../components/marketing/layout/Navbar';
import PageHeader from '../../../components/marketing/common/sections/PageHeader';
import ContentSplit from '../../../components/marketing/common/sections/ContentSplit';
import ProductFeaturesShowcase from '../../../components/marketing/common/sections/ProductFeaturesShowcase';
import FeatureGrid from '../../../components/marketing/common/sections/FeatureGrid';
import FAQSection from '../../../components/marketing/common/sections/FAQSection';
import CTA from '../../../components/marketing/common/sections/CTA';
import Footer from '../../../components/marketing/layout/Footer';

const KioskModeProduct = () => {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Kiosk Mode | Chatters - Dedicated Feedback Stations</title>
        <meta
          name="description"
          content="Turn any tablet into a dedicated feedback kiosk. Perfect for retail stores, hotels, and high-traffic areas where QR codes aren't practical."
        />
        <meta
          name="keywords"
          content="feedback kiosk, tablet feedback, in-store feedback, retail feedback kiosk, customer feedback station, touch screen feedback"
        />
        <meta property="og:title" content="Kiosk Mode | Chatters" />
        <meta property="og:description" content="Transform any tablet into a professional feedback kiosk with Chatters' dedicated kiosk mode." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://getchatters.com/product/kiosk-mode" />
      </Helmet>

      {/* Overlay navbar sits above the hero */}
      <Navbar overlay />

      <PageHeader
        title="Kiosk Mode That Turns Any Tablet Into a Feedback Station"
        description="Create dedicated spots where your staff can view and respond to customer feedback in real-time. Perfect for retail stores, hotels, and anywhere you want to make feedback convenient."
        backgroundGradient="from-white to-orange-200"
        showSubtitle={true}
        subtitle="Kiosk Mode"
      />

      <ContentSplit
        eyebrow="Dedicated Stations"
        eyebrowColour='text-orange-600'
        title="A simple view, respond, and manage feedback interface."
        description="No fluff, no distractions. Just a clean, focused interface that lets your team see customer feedback and respond instantly."
        bullets={[
          "Works on any tablet or desktop",
          "Secure kiosk mode lockdown", 
          "Easy to manage",
        ]}
        primaryCta={{ label: "See Kiosk Mode", to: "/demo" }}
        secondaryCta={{ label: "Pricing", to: "/pricing" }}
        image={{ src: "/img/mock-kiosk.png", alt: "Feedback kiosk interface" }}
      />

      <ProductFeaturesShowcase
        eyebrow="Kiosk Intelligence"
        eyebrowColour='text-orange-600'
        title="Place your station anywhere, receive feedback instantly."
        description="Kiosk mode is designed for security, ease of use, and flexibility. Turn any tablet into a professional feedback station that captures customer insights in real-time."
        primaryCta={{ label: "See Kiosk Mode", to: "/demo" }}
        secondaryCta={{ label: "Pricing", to: "/pricing" }}
        features={[
          {
            id: "setup",
            eyebrow: "Easy Setup",
            title: "Turn tablets or laptops into kiosks instantly",
            description: "Just click 'Kiosk Mode' in the Chatters dashboard to transform any device into a dedicated feedback station.",
            bullets: ["No additional devices", "Instant setup", "Easy to use"],
            // image: { src: "/img/mock-setup.png", alt: "Kiosk setup process" },
          },
          {
            id: "design",
            eyebrow: "Real-time",
            title: "No wasting time waiting",
            description: "No waiting around, or refreshing, feedback is displayed instantly as it comes in. Your team can respond immediately to customer concerns.",
            bullets: ["Live updates ", "Offline mode", "Instant notifications"],
            // image: { src: "/img/mock-design.png", alt: "Kiosk customisation" },
          },
          {
            id: "security",
            eyebrow: "Secure Mode",
            title: "Locked down for security",
            description: "Kiosk mode prevents your staff from accessing other apps or settings, keeping your device secure while allowing feedback resolution.",
            bullets: ["App lockdown", "Auto-reset timer", "Tamper protection"],
            // image: { src: "/img/mock-security.png", alt: "Security features" },
          },
        ]}
      />


      <FeatureGrid
        eyebrow="Kiosk Benefits"
        eyebrowColour='text-orange-600'
        title="Why businesses choose kiosk mode"
        description="Dedicated feedback stations increase response rates and provide a professional way to gather customer insights in high-traffic areas."
        gradientDirection="bg-gradient-to-b"
        backgroundGradient="from-white to-orange-50"
        dottedBackground={true}
        orbGlow
        cols={{ base: 1, sm: 2, md: 3, lg: 3 }}
        items={[
          {
            icon: <Tablet className="w-6 h-6 text-orange-600" />,
            title: "Universal compatibility",
            description:
              "Works with any iPad, Android tablet, or touch screen device you already own - no special hardware needed.",
          },
          {
            icon: <Touchpad className="w-6 h-6 text-orange-600" />,
            title: "Touch-optimized interface",
            description:
              "Large buttons and touch-friendly design makes it easy for customers of all ages to leave feedback.",
          },
          {
            icon: <Wifi className="w-6 h-6 text-orange-600" />,
            title: "Works offline",
            description:
              "Feedback is stored locally when internet is unavailable and syncs automatically when connection returns.",
          },
          {
            icon: <Lock className="w-6 h-6 text-orange-600" />,
            title: "Secure kiosk mode",
            description:
              "Prevents access to other apps or settings while allowing customers to submit feedback freely.",
          },
          {
            icon: <Palette className="w-6 h-6 text-orange-600" />,
            title: "Complete customization",
            description:
              "Match your brand with custom colors, logos, fonts, and layouts that fit your business perfectly.",
          },
          {
            icon: <Zap className="w-6 h-6 text-orange-600" />,
            title: "Higher response rates",
            description:
              "Dedicated stations catch customers at the right moment, increasing feedback completion rates significantly.",
          },
        ]}
        wavyBottom={true}
      />

      <FAQSection
        eyebrow="Kiosk FAQ"
        eyebrowColour='text-orange-600'
        title="Everything you need to know"
        description="If you have a different question, contact us and we'll help."
        dottedBackground
        orbGlow
        wavyBottom={false}
        backgroundGradient="from-white via-white to-orange-50"
        gradientDirection="bg-gradient-to-b"
        defaultOpenIndex={0}
        faqs={[
          { q: "What devices work with kiosk mode?", a: "Any iPad (iOS 12+) or Android tablet (Android 8+) works perfectly. We also support Windows tablets and touch screen computers." },
          { q: "How secure is kiosk mode?", a: "Very secure - customers can only access the feedback form. The device is locked from other apps, settings, or web browsing." },
          { q: "What if the internet goes down?", a: "Kiosks continue working offline, storing feedback locally. Data syncs automatically when internet returns - you'll never lose responses." },
          { q: "Can I customize how the kiosk looks?", a: "Completely - customize colors, logos, fonts, button styles, and layout to match your brand perfectly." },
        ]}
      />

      <CTA 
        title="Turn any tablet into a professional feedback station" 
        subtitle="Start your free trial and create branded kiosks that increase customer feedback participation."
        buttonText="Book a Demo"
        buttonLink="/demo"
        gradientDirection="bg-gradient-to-r"
        backgroundGradient="from-orange-50 via-white to-yellow-50"
      />


      <Footer />
    </div>
  );
};

export default KioskModeProduct;
