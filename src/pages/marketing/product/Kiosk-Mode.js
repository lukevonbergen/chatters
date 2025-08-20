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
        description="Perfect for retail stores, hotel lobbies, and anywhere QR codes aren't practical. Create dedicated feedback stations that customers actually want to use."
        backgroundGradient="from-white to-orange-200"
        showSubtitle={true}
        subtitle="Kiosk Mode"
      />

      <ContentSplit
        eyebrow="Dedicated Stations"
        title="Professional feedback kiosks that customers actually use."
        description="Transform any iPad or Android tablet into a polished feedback station. Perfect for retail stores, hotel lobbies, restaurants, and anywhere you want to make feedback convenient."
        bullets={[
          "Works with any tablet device",
          "Secure kiosk mode lockdown", 
          "Custom branding & themes",
          "Offline capability built-in"
        ]}
        primaryCta={{ label: "Try kiosk mode", to: "/signup" }}
        secondaryCta={{ label: "See demo", to: "/demo" }}
        image={{ src: "/img/mock-kiosk.png", alt: "Feedback kiosk interface" }}
      />

      <ProductFeaturesShowcase
        eyebrow="Kiosk Intelligence"
        title="Professional feedback stations that work everywhere."
        description="Our kiosk mode transforms any tablet into a secure, branded feedback station that looks professional and encourages customer participation."
        primaryCta={{ label: "Set up kiosks", to: "/signup" }}
        secondaryCta={{ label: "View gallery", to: "/demo" }}
        features={[
          {
            id: "setup",
            eyebrow: "Easy Setup",
            title: "Turn tablets into kiosks instantly",
            description: "Install our app on any iPad or Android tablet and activate kiosk mode. No special hardware or technical setup required.",
            bullets: ["Works with existing tablets", "5-minute setup", "Remote configuration"],
            image: { src: "/img/mock-setup.png", alt: "Kiosk setup process" },
          },
          {
            id: "design",
            eyebrow: "Custom Design",
            title: "Match your brand perfectly",
            description: "Customize colors, logos, fonts, and layout to create kiosks that seamlessly blend with your business environment.",
            bullets: ["Full brand customization", "Multiple themes", "Layout options"],
            image: { src: "/img/mock-design.png", alt: "Kiosk customization" },
          },
          {
            id: "security",
            eyebrow: "Secure Mode",
            title: "Locked down for public use",
            description: "Kiosk mode prevents customers from accessing other apps or settings, keeping your device secure while allowing feedback submission.",
            bullets: ["App lockdown", "Auto-reset timer", "Tamper protection"],
            image: { src: "/img/mock-security.png", alt: "Security features" },
          },
        ]}
      />


      <FeatureGrid
        eyebrow="Kiosk Benefits"
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
        buttonText="Set up kiosks"
        buttonLink="/signup"
        gradientDirection="bg-gradient-to-r"
        backgroundGradient="from-orange-50 via-white to-yellow-50"
      />


      <Footer />
    </div>
  );
};

export default KioskModeProduct;
