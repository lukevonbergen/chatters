import React from 'react';
import { Helmet } from 'react-helmet';
import { Sparkles, Brain, TrendingUp, BarChart3, Target, AlertCircle, CheckCircle, Lightbulb, Clock } from 'lucide-react';
import Navbar from '../../../components/marketing/layout/Navbar';
import PageHeader from '../../../components/marketing/common/sections/PageHeader';
import ContentSplit from '../../../components/marketing/common/sections/ContentSplit';
import ProductFeaturesShowcase from '../../../components/marketing/common/sections/ProductFeaturesShowcase';
import FeatureGrid from '../../../components/marketing/common/sections/FeatureGrid';
import FAQSection from '../../../components/marketing/common/sections/FAQSection';
import CTA from '../../../components/marketing/common/sections/CTA';
import Footer from '../../../components/marketing/layout/Footer';

const IntelligenceProduct = () => {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Chatters Intelligence | AI-Powered Customer Insights</title>
        <meta
          name="description"
          content="Transform customer feedback into actionable intelligence with AI. Get instant insights, predictive analytics, and data-driven recommendations powered by Chatters Intelligence."
        />
        <meta
          name="keywords"
          content="AI insights, customer intelligence, feedback analysis, AI analytics, predictive insights, machine learning, customer sentiment"
        />
        <meta property="og:title" content="Chatters Intelligence | AI-Powered Customer Insights" />
        <meta property="og:description" content="Harness the power of AI to transform customer feedback into actionable intelligence with Chatters Intelligence." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://getchatters.com/product/intelligence" />
      </Helmet>

      {/* Overlay navbar sits above the hero */}
      <Navbar overlay />

      <PageHeader
        title="AI-Powered Intelligence That Transforms Feedback Into Action"
        description="Stop drowning in data. Let AI analyse thousands of customer responses instantly, identify critical trends, and deliver actionable recommendations that drive real business results."
        backgroundGradient="from-white via-purple-50 to-blue-100"
        showSubtitle={true}
        subtitle="Chatters Intelligence"
      />

      <ContentSplit reversed
        eyebrow="Advanced AI Analytics"
        eyebrowColour='text-purple-600'
        title="Your AI analyst, working 24/7 to understand your customers."
        description="Chatters Intelligence uses advanced AI to analyse customer feedback in seconds, not hours. Get comprehensive insights with AI-generated scores, critical alerts, strengths, areas for improvement, and specific action plans—all tailored to your business."
        bullets={[
          "AI-generated performance scores (0-10)",
          "Instant critical insights identification",
          "Automated trend detection & analysis",
          "Actionable improvement recommendations"
        ]}
        primaryCta={{ label: "See it in action", to: "/demo" }}
        secondaryCta={{ label: "Learn more", to: "/contact" }}
        image={{ src: "/img/product_pages/intelligence/ai-insights-hero.png", alt: "AI Intelligence Dashboard" }}
      />

      <ProductFeaturesShowcase
        eyebrow="AI Features"
        eyebrowColour='text-purple-600'
        title="Intelligent insights, delivered instantly."
        description="Our AI doesn't just collect data—it thinks. Chatters Intelligence analyses feedback context, sentiment, and patterns to deliver insights that feel human-crafted but are available in seconds."
        primaryCta={{ label: "Book a demo", to: "/demo" }}
        secondaryCta={{ label: "View pricing", to: "/pricing" }}
        features={[
          {
            id: "ai-score",
            eyebrow: "Performance",
            title: "AI Performance Scoring",
            description: "Get an instant overall performance score (0-10) based on comprehensive analysis of all feedback, NPS responses, and historical trends. Track improvement over time with confidence.",
            bullets: ["Holistic performance scoring", "Historical trend comparison", "Automatic scoring criteria", "Progress tracking"],
            image: { src: "/img/mock-ai-score.png", alt: "AI Performance Score" },
          },
          {
            id: "critical-insights",
            eyebrow: "Alerts",
            title: "Critical Insights Detection",
            description: "AI automatically identifies the most urgent issues requiring immediate attention. Never miss a critical problem again with intelligent prioritisation and context-aware alerts.",
            bullets: ["Automatic issue prioritisation", "Context-aware analysis", "Severity classification", "Root cause identification"],
            image: { src: "/img/mock-critical-insights.png", alt: "Critical Insights" },
          },
          {
            id: "recommendations",
            eyebrow: "Actions",
            title: "Actionable Recommendations",
            description: "Receive specific, implementable recommendations tailored to your business. AI suggests exactly what to do, how to do it, and why it matters—no guesswork required.",
            bullets: ["Specific action plans", "Prioritised improvements", "Implementation guidance", "Expected impact predictions"],
            image: { src: "/img/mock-recommendations.png", alt: "AI Recommendations" },
          },
        ]}
      />

      <FeatureGrid
        eyebrow="Intelligence Benefits"
        eyebrowColour='text-purple-600'
        title="Why businesses trust AI-powered insights"
        description="Make faster, smarter decisions backed by AI that understands context, detects patterns, and delivers insights you can act on immediately."
        gradientDirection="bg-gradient-to-b"
        backgroundGradient="from-white to-purple-50"
        dottedBackground={true}
        orbGlow
        cols={{ base: 1, sm: 2, md: 3, lg: 3 }}
        items={[
          {
            icon: <Brain className="w-6 h-6 text-purple-600" />,
            title: "Context-aware analysis",
            description:
              "AI understands nuance, sentiment, and context—not just keywords. Get insights that reflect the true voice of your customers.",
          },
          {
            icon: <Clock className="w-6 h-6 text-purple-600" />,
            title: "Instant insights",
            description:
              "What used to take hours of manual analysis now happens in seconds. Get comprehensive insights the moment you need them.",
          },
          {
            icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
            title: "Trend identification",
            description:
              "AI spots emerging patterns and trends before they become problems, giving you time to act proactively.",
          },
          {
            icon: <Target className="w-6 h-6 text-purple-600" />,
            title: "Targeted recommendations",
            description:
              "Get specific, actionable advice tailored to your venue, not generic suggestions. AI considers your unique context.",
          },
          {
            icon: <BarChart3 className="w-6 h-6 text-purple-600" />,
            title: "Historical comparison",
            description:
              "AI tracks your progress over time, identifying whether issues are improving, worsening, or remaining constant.",
          },
          {
            icon: <Lightbulb className="w-6 h-6 text-purple-600" />,
            title: "Smart caching",
            description:
              "Results are cached for instant retrieval. Run the same analysis again with no wait time.",
          },
        ]}
        wavyBottom={true}
      />

      <div className="py-16 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              From feedback to action in three steps
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Chatters Intelligence makes it effortless to understand what your customers are telling you and what to do about it.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-bold text-xl mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Select Date Range</h3>
              <p className="text-gray-600 leading-relaxed">
                Choose the time period you want to analyse. From a single day to months of feedback—AI handles any volume instantly.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-bold text-xl mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Analyses Everything</h3>
              <p className="text-gray-600 leading-relaxed">
                Chatters Intelligence processes all feedback, NPS scores, ratings, and historical data to identify patterns, sentiment, and critical issues.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-bold text-xl mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Get Actionable Insights</h3>
              <p className="text-gray-600 leading-relaxed">
                Receive a comprehensive report with scores, critical alerts, strengths, areas for improvement, and specific recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>

      <FAQSection
        eyebrow="Intelligence FAQ"
        eyebrowColour='text-purple-600'
        title="Everything you need to know"
        description="If you have a different question, contact us and we'll help."
        dottedBackground
        orbGlow
        wavyBottom={false}
        backgroundGradient="from-white via-white to-purple-50"
        gradientDirection="bg-gradient-to-b"
        defaultOpenIndex={0}
        faqs={[
          {
            q: "How does the AI generate insights?",
            a: "Chatters Intelligence uses advanced AI to analyse all your feedback data, NPS scores, and ratings. It identifies patterns, sentiment, and context to deliver comprehensive insights including performance scores, critical issues, strengths, weaknesses, and specific recommendations tailored to your business."
          },
          {
            q: "How long does analysis take?",
            a: "AI analysis typically completes in 5-15 seconds, regardless of data volume. Analysing months of feedback takes the same time as a single day. Once generated, insights are cached for instant retrieval."
          },
          {
            q: "Is this included in my plan?",
            a: "Yes, Chatters Intelligence is included with your Chatters subscription. There are no additional charges for generating AI insights. Results are cached, so re-running the same date range is instant."
          },
          {
            q: "Can I trust the AI's recommendations?",
            a: "Yes. Chatters Intelligence is trained to provide accurate, context-aware analysis. It considers your specific data, historical trends, and industry best practices. The AI always bases recommendations on actual customer feedback, not assumptions."
          },
          {
            q: "Does it replace human analysis?",
            a: "No—it enhances it. AI handles the time-consuming work of processing data and identifying patterns, freeing you to focus on strategy and implementation. The AI provides the insights; you make the final decisions based on your business knowledge."
          },
          {
            q: "What makes this different from regular analytics?",
            a: "Traditional analytics show you what happened (charts, numbers, percentages). Chatters Intelligence tells you why it happened, what it means, and exactly what to do about it. It's the difference between seeing '20% negative feedback on cleanliness' and receiving 'Hygiene rated 2.9/5, 41% below average—implement daily deep-cleaning checklists immediately.'"
          },
        ]}
      />

      <CTA
        title="Make smarter decisions with AI-powered intelligence"
        subtitle="Stop guessing. Start knowing. Let AI transform your customer feedback into clear, actionable insights that drive measurable business results."
        buttonText="Book a Demo"
        buttonLink="/demo"
        gradientDirection="bg-gradient-to-r"
        backgroundGradient="from-purple-50 via-white to-blue-50"
      />

      <Footer />
    </div>
  );
};

export default IntelligenceProduct;
