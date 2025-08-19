import React from 'react';
import { Helmet } from 'react-helmet';
import { ArrowRight, BarChart3, CheckCircle, TrendingUp, PieChart, Target, Clock, DollarSign, Users } from 'lucide-react';
import Navbar from '../../components/marketing/layout/Navbar';
import Footer from '../../components/marketing/layout/Footer';
import CTASection from '../../components/marketing/sections/CTASection';

const BusinessIntelligenceFeature = () => {
  const features = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Customer Satisfaction Trends",
      description: "Track satisfaction trends over time with predictive analytics to identify patterns and forecast future performance."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Staff Performance Analytics",
      description: "Measure individual and team performance metrics to identify top performers and training opportunities."
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Revenue Impact Analysis",
      description: "Correlate customer feedback with revenue data to understand the financial impact of customer satisfaction."
    },
    {
      icon: <PieChart className="w-6 h-6" />,
      title: "Advanced Reporting Dashboard",
      description: "Comprehensive dashboards with customizable metrics, filters, and automated report generation."
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Benchmarking & Goals",
      description: "Set performance targets and benchmark against industry standards to drive continuous improvement."
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Real-Time Insights",
      description: "Access live data and insights as they happen, enabling immediate decision-making and response."
    }
  ];

  const metrics = [
    { metric: "Customer Satisfaction Score", description: "Track overall satisfaction trends and identify improvement areas" },
    { metric: "Net Promoter Score (NPS)", description: "Measure customer loyalty and likelihood to recommend your business" },
    { metric: "Response Time Analytics", description: "Monitor how quickly your team responds to customer feedback" },
    { metric: "Issue Resolution Rate", description: "Track success rates in resolving customer complaints and concerns" },
    { metric: "Peak Performance Times", description: "Identify when your business performs best and optimize accordingly" },
    { metric: "Staff Efficiency Scores", description: "Measure individual and team performance across all touchpoints" }
  ];

  const benefits = [
    "Make data-driven decisions with comprehensive analytics and reporting",
    "Identify revenue opportunities through customer satisfaction insights",
    "Optimize staff performance with detailed individual and team metrics",
    "Predict future trends with advanced forecasting algorithms",
    "Benchmark performance against industry standards and competitors",
    "Automate reporting to save time and ensure consistent monitoring"
  ];

  return (
    <div className="min-h-screen bg-[#082524]">
      <Helmet>
        <title>Business Intelligence | Chatters - Advanced Analytics & Insights</title>
        <meta 
          name="description" 
          content="Transform customer feedback into actionable business insights. Advanced analytics, performance tracking, and revenue impact analysis with Chatters Business Intelligence."
        />
        <meta 
          name="keywords" 
          content="business intelligence, customer analytics, performance metrics, revenue analysis, satisfaction tracking, data insights"
        />
        <meta property="og:title" content="Business Intelligence | Chatters" />
        <meta property="og:description" content="Advanced analytics and performance insights from customer feedback data." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://getchatters.com/features/business-intelligence" />
      </Helmet>

      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-[#082524] pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#4ECDC4]/20">
                <BarChart3 className="h-8 w-8 text-[#4ECDC4]" />
              </div>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 font-satoshi">
              Advanced
              <span className="text-[#4ECDC4]"> Business Intelligence</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 leading-relaxed font-satoshi">
              Transform customer feedback into actionable business insights. Track performance, identify trends, and make data-driven decisions with our comprehensive Business Intelligence platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/demo" 
                className="group bg-[#4ECDC4] text-[#082524] px-8 py-4 rounded-xl text-lg font-semibold hover:bg-[#3db8b8] transition-all duration-300 font-satoshi shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                View Analytics Demo
                <ArrowRight className="ml-2 w-5 h-5 transform transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a 
                href="/pricing" 
                className="group border-2 border-[#4ECDC4] bg-transparent text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-[#4ECDC4] hover:text-[#082524] transition-all duration-300 font-satoshi flex items-center justify-center"
              >
                View Pricing
                <ArrowRight className="ml-2 w-5 h-5 transform transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-white">
        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#1A535C] mb-4 font-satoshi">
                Powerful Analytics & Insights
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto font-satoshi">
                Turn customer feedback into strategic business advantages with comprehensive analytics and intelligent reporting.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
                  <div className="w-12 h-12 bg-[#4ECDC4]/20 rounded-xl flex items-center justify-center text-[#4ECDC4] mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-[#1A535C] mb-4 font-satoshi">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed font-satoshi">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Key Metrics Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#1A535C] mb-4 font-satoshi">
                Essential Business Metrics
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto font-satoshi">
                Track the metrics that matter most to your business success and customer satisfaction.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {metrics.map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <h3 className="text-lg font-semibold text-[#1A535C] mb-3 font-satoshi">{item.metric}</h3>
                  <p className="text-gray-600 font-satoshi">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-[#1A535C] mb-4 font-satoshi">
                  Drive Growth with Data-Driven Insights
                </h2>
                <p className="text-xl text-gray-600 font-satoshi">
                  Transform customer feedback into strategic business advantages that drive growth and profitability.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-[#4ECDC4]" />
                    </div>
                    <p className="text-gray-700 font-satoshi">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Placeholder Dashboard Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#1A535C] mb-4 font-satoshi">
                Interactive Analytics Dashboard
              </h2>
            </div>
            <div className="max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-[#F7FFF7] to-[#4ECDC4]/10 rounded-3xl border-2 border-[#4ECDC4]/20 p-16 text-center">
                <div className="w-24 h-24 bg-[#4ECDC4]/20 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <BarChart3 className="w-12 h-12 text-[#4ECDC4]" />
                </div>
                <h3 className="text-2xl font-bold text-[#1A535C] mb-4 font-satoshi">Live Dashboard Preview</h3>
                <p className="text-gray-600 font-satoshi max-w-2xl mx-auto">See real-time analytics, trend analysis, and performance metrics in our comprehensive Business Intelligence dashboard.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ROI Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-[#1A535C] to-[#4ECDC4] rounded-3xl p-12 text-white text-center">
              <h2 className="text-4xl font-bold mb-6 font-satoshi">Measurable Business Impact</h2>
              <p className="text-xl mb-8 opacity-90 font-satoshi max-w-3xl mx-auto">
                Our customers see tangible results from data-driven decision making powered by customer feedback insights.
              </p>
              <div className="grid md:grid-cols-3 gap-8 mt-12">
                <div>
                  <div className="text-4xl font-bold mb-2 font-satoshi">25%</div>
                  <div className="text-lg font-satoshi">Average Revenue Increase</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2 font-satoshi">40%</div>
                  <div className="text-lg font-satoshi">Improvement in Customer Retention</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2 font-satoshi">60%</div>
                  <div className="text-lg font-satoshi">Faster Issue Resolution</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <CTASection 
        title="Ready to Unlock Business Insights?"
        description="Transform your customer feedback into powerful business intelligence that drives growth and improves performance."
        primaryButtonText="Start Analytics Trial"
        secondaryButtonText="Schedule Demo"
        secondaryButtonLink="/demo"
      />

      <Footer />
    </div>
  );
};

export default BusinessIntelligenceFeature;