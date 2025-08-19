import React from 'react';
import { Helmet } from 'react-helmet';
import { ArrowRight, HelpCircle, CheckCircle, Star, Users, Globe, Zap, BarChart3, Settings } from 'lucide-react';
import Navbar from '../../components/marketing/layout/Navbar';
import Footer from '../../components/marketing/layout/Footer';
import CTASection from '../../components/marketing/sections/CTASection';

const QuestionManagementFeature = () => {
  const features = [
    {
      icon: <Settings className="w-6 h-6" />,
      title: "Dynamic Question Branching",
      description: "Create intelligent question flows that adapt based on customer responses, ensuring relevant feedback collection."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Industry-Specific Templates",
      description: "Pre-built question sets tailored for restaurants, hotels, retail, and events - ready to deploy instantly."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Multi-Language Support",
      description: "Collect feedback in multiple languages to serve diverse customer bases effectively."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Question Performance Analytics",
      description: "Track which questions generate the most actionable feedback and optimize your forms accordingly."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Smart Skip Logic",
      description: "Reduce survey fatigue with intelligent question skipping based on previous responses."
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Custom Validation Rules",
      description: "Ensure data quality with custom validation rules and required field configurations."
    }
  ];

  const benefits = [
    "Increase completion rates by up to 40% with optimized question flows",
    "Reduce survey abandonment through intelligent question branching",
    "Collect more targeted and actionable customer feedback",
    "Save setup time with industry-specific templates",
    "Support global customers with multi-language capabilities",
    "Continuously improve feedback quality with performance analytics"
  ];

  const questionTypes = [
    { type: "Rating Scales", description: "1-5 star ratings, NPS scores, satisfaction levels" },
    { type: "Multiple Choice", description: "Single or multi-select options for specific feedback" },
    { type: "Open Text", description: "Free-form responses for detailed customer insights" },
    { type: "Yes/No Questions", description: "Binary choices for quick decision points" },
    { type: "Image Selection", description: "Visual feedback options for better engagement" },
    { type: "Conditional Logic", description: "Dynamic questions based on previous responses" }
  ];

  return (
    <div className="min-h-screen bg-[#082524]">
      <Helmet>
        <title>Question Management | Chatters - Custom Feedback Forms</title>
        <meta 
          name="description" 
          content="Create intelligent feedback forms with dynamic question flows, industry templates, and multi-language support. Optimize customer feedback collection with Chatters Question Management."
        />
        <meta 
          name="keywords" 
          content="question management, feedback forms, survey builder, dynamic questions, customer feedback, form templates"
        />
        <meta property="og:title" content="Question Management | Chatters" />
        <meta property="og:description" content="Build intelligent feedback forms with dynamic question flows and industry-specific templates." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://getchatters.com/features/question-management" />
      </Helmet>

      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-[#082524] pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#4ECDC4]/20">
                <HelpCircle className="h-8 w-8 text-[#4ECDC4]" />
              </div>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 font-satoshi">
              Intelligent
              <span className="text-[#4ECDC4]"> Question Management</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 leading-relaxed font-satoshi">
              Create dynamic feedback forms that adapt to your customers. Build intelligent question flows, use industry templates, and collect more meaningful feedback with our advanced Question Management system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/demo" 
                className="group bg-[#4ECDC4] text-[#082524] px-8 py-4 rounded-xl text-lg font-semibold hover:bg-[#3db8b8] transition-all duration-300 font-satoshi shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                Try Question Builder
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
                Smart Question Management Features
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto font-satoshi">
                Build better feedback forms with intelligent features designed to increase completion rates and gather more actionable insights.
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

        {/* Question Types Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#1A535C] mb-4 font-satoshi">
                Powerful Question Types
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto font-satoshi">
                Choose from a wide variety of question types to create engaging and effective feedback forms.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {questionTypes.map((type, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <h3 className="text-lg font-semibold text-[#1A535C] mb-3 font-satoshi">{type.type}</h3>
                  <p className="text-gray-600 text-sm font-satoshi">{type.description}</p>
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
                  Why Choose Smart Question Management?
                </h2>
                <p className="text-xl text-gray-600 font-satoshi">
                  Transform your feedback collection with intelligent question flows that get better results.
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

        {/* Placeholder Image Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#1A535C] mb-4 font-satoshi">
                See Question Management in Action
              </h2>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-[#F7FFF7] to-[#4ECDC4]/10 rounded-3xl border-2 border-[#4ECDC4]/20 p-16 text-center">
                <div className="w-24 h-24 bg-[#4ECDC4]/20 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <HelpCircle className="w-12 h-12 text-[#4ECDC4]" />
                </div>
                <h3 className="text-2xl font-bold text-[#1A535C] mb-4 font-satoshi">Interactive Demo Coming Soon</h3>
                <p className="text-gray-600 font-satoshi">Experience our Question Management system with a live demo showing dynamic question flows and intelligent branching.</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <CTASection 
        title="Ready to Build Smarter Questions?"
        description="Start creating intelligent feedback forms that adapt to your customers and deliver better insights for your business."
        primaryButtonText="Start Free Trial"
        secondaryButtonText="View All Features"
        secondaryButtonLink="/features"
      />

      <Footer />
    </div>
  );
};

export default QuestionManagementFeature;