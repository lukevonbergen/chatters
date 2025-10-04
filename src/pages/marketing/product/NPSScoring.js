import React from 'react';
import { Helmet } from 'react-helmet';
import { TrendingUp, ThumbsUp, ThumbsDown, BarChart3, Target, LineChart } from 'lucide-react';
import Navbar from '../../../components/marketing/layout/Navbar';
import PageHeader from '../../../components/marketing/common/sections/PageHeader';
import ContentSplit from '../../../components/marketing/common/sections/ContentSplit';
import ProductFeaturesShowcase from '../../../components/marketing/common/sections/ProductFeaturesShowcase';
import FeatureGrid from '../../../components/marketing/common/sections/FeatureGrid';
import FAQSection from '../../../components/marketing/common/sections/FAQSection';
import CTA from '../../../components/marketing/common/sections/CTA';
import Footer from '../../../components/marketing/layout/Footer';

const NPSScoringPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>NPS Scoring & Tracking | Chatters - Measure Customer Loyalty Automatically</title>
        <meta
          name="description"
          content="Track Net Promoter Score (NPS) automatically with Chatters. Get real-time customer loyalty insights, identify promoters and detractors, and improve satisfaction in hospitality businesses."
        />
        <meta
          name="keywords"
          content="NPS scoring, Net Promoter Score, customer loyalty, NPS tracking, customer satisfaction measurement, hospitality NPS, NPS software, customer experience metrics"
        />
        <meta property="og:title" content="NPS Scoring & Tracking | Chatters" />
        <meta property="og:description" content="Automatically track and improve your Net Promoter Score with real-time customer feedback and actionable insights." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://getchatters.com/product/nps-scoring" />
      </Helmet>

      <Navbar overlay />

      <PageHeader
        title="Track Net Promoter Score and Turn Feedback Into Loyalty"
        description="Automatically measure customer loyalty with NPS scoring. Identify promoters to celebrate and detractors to win back—all while tracking your score in real-time across every location."
        backgroundGradient="from-white to-blue-200"
        showSubtitle={true}
        subtitle="NPS Scoring"
      />

      <ContentSplit
        eyebrow="Customer Loyalty Metrics"
        eyebrowColour='text-blue-600'
        title="Turn customer sentiment into actionable NPS data."
        description="Every piece of feedback automatically calculates your Net Promoter Score. See real-time NPS trends, identify promoters and detractors, and take action before negative experiences hurt your reputation."
        bullets={[
          "Automatic NPS calculation",
          "Real-time score tracking",
          "Promoter & detractor identification",
          "Multi-location NPS comparison"
        ]}
        primaryCta={{ label: "Start tracking NPS", to: "/signup" }}
        secondaryCta={{ label: "See demo", to: "/demo" }}
        image={{ src: "/img/mock-dashboard.png", alt: "NPS dashboard interface" }}
      />

      <ProductFeaturesShowcase
        eyebrow="NPS Intelligence"
        eyebrowColour='text-blue-600'
        title="From feedback to loyalty insights."
        description="Chatters automatically converts customer feedback into NPS scores, giving you the loyalty metrics that matter most. Track trends, benchmark locations, and take action on what drives customer advocacy."
        primaryCta={{ label: "Try NPS tracking", to: "/signup" }}
        secondaryCta={{ label: "View examples", to: "/demo" }}
        features={[
          {
            id: "automatic",
            eyebrow: "Automated Scoring",
            title: "NPS calculated automatically from feedback",
            description: "Every customer feedback response automatically updates your NPS score in real-time. No manual surveys or spreadsheet calculations required.",
            bullets: ["Real-time NPS updates", "Automatic categorization", "No survey fatigue"],
            image: { src: "/img/mock-metrics.png", alt: "Automatic NPS calculation" },
          },
          {
            id: "segmentation",
            eyebrow: "Smart Segmentation",
            title: "Identify promoters, passives, and detractors",
            description: "See exactly who loves your brand and who's at risk of leaving. Get detailed breakdowns with customer contact info to take immediate action.",
            bullets: ["Promoter identification", "Detractor alerts", "Passive tracking"],
            image: { src: "/img/mock-routing.png", alt: "NPS segmentation dashboard" },
          },
          {
            id: "trends",
            eyebrow: "Performance Tracking",
            title: "Track NPS trends over time",
            description: "See how your customer loyalty evolves weekly, monthly, or quarterly. Identify what's working and spot problems before they impact your business.",
            bullets: ["Historical trends", "Benchmark comparisons", "Location-specific scores"],
            image: { src: "/img/mock-oversight.png", alt: "NPS trend analysis" },
          },
        ]}
      />

      <FeatureGrid
        eyebrow="NPS Benefits"
        eyebrowColour='text-blue-600'
        title="Why NPS scoring matters for hospitality"
        description="Net Promoter Score is the gold standard for measuring customer loyalty. Track it automatically and use insights to build a customer experience worth recommending."
        gradientDirection="bg-gradient-to-b"
        backgroundGradient="from-white to-blue-50"
        dottedBackground={true}
        orbGlow
        cols={{ base: 1, sm: 2, md: 3, lg: 3 }}
        items={[
          {
            icon: <TrendingUp className="w-6 h-6 text-blue-600" />,
            title: "Predict business growth",
            description:
              "NPS is proven to correlate with revenue growth. Higher scores mean more customer referrals and repeat business.",
          },
          {
            icon: <ThumbsUp className="w-6 h-6 text-blue-600" />,
            title: "Leverage your promoters",
            description:
              "Identify customers who love your brand and ask them for reviews, referrals, or testimonials at the perfect moment.",
          },
          {
            icon: <ThumbsDown className="w-6 h-6 text-blue-600" />,
            title: "Win back detractors",
            description:
              "Get alerted when customers have negative experiences so you can reach out and turn them into promoters.",
          },
          {
            icon: <BarChart3 className="w-6 h-6 text-blue-600" />,
            title: "Benchmark performance",
            description:
              "Compare NPS across locations, time periods, and industry standards to understand where you stand.",
          },
          {
            icon: <Target className="w-6 h-6 text-blue-600" />,
            title: "Set measurable goals",
            description:
              "Use NPS as a clear, quantifiable metric for customer experience goals across your organization.",
          },
          {
            icon: <LineChart className="w-6 h-6 text-blue-600" />,
            title: "Track improvement",
            description:
              "See the impact of your customer experience initiatives reflected in real-time NPS score changes.",
          },
        ]}
        wavyBottom={true}
      />

      <FAQSection
        eyebrow="NPS FAQ"
        eyebrowColour='text-blue-600'
        title="Everything you need to know"
        description="If you have a different question, contact us and we'll help."
        dottedBackground
        orbGlow
        wavyBottom={false}
        backgroundGradient="from-white via-white to-blue-50"
        gradientDirection="bg-gradient-to-b"
        defaultOpenIndex={0}
        faqs={[
          { q: "How is NPS calculated?", a: "NPS is calculated by subtracting the percentage of detractors (0-6 ratings) from the percentage of promoters (9-10 ratings). Chatters does this automatically from your feedback data." },
          { q: "What's a good NPS score for hospitality?", a: "Hospitality NPS varies, but scores above 50 are excellent, 30-50 is good, and 0-30 indicates room for improvement. Chatters helps you track and improve your score over time." },
          { q: "Can I see NPS by location?", a: "Yes! Multi-location businesses can compare NPS across venues to identify top performers and locations that need support." },
          { q: "How do I act on promoters and detractors?", a: "Chatters identifies promoters and detractors with their contact info. Send personalized follow-ups, request reviews from promoters, or resolve issues with detractors." },
        ]}
      />

      <CTA
        title="Start tracking your Net Promoter Score today"
        subtitle="Turn customer feedback into loyalty metrics that drive growth and improvement."
        buttonText="Book a Demo"
        buttonLink="/demo"
        gradientDirection="bg-gradient-to-r"
        backgroundGradient="from-blue-50 via-white to-indigo-50"
      />

      <Footer />
    </div>
  );
};

export default NPSScoringPage;
