import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { ArrowRight, CheckCircle, Star, TrendingUp, Shield, Zap, Users, BarChart3, MessageSquare, AlertTriangle, Smartphone, Globe, Clock, Award, ChevronDown, Menu, X, Settings, BookOpen, Phone, Mail, HelpCircle, FileText, Briefcase, Building, CreditCard, PlayCircle, Monitor } from 'lucide-react';
import Navbar from './Navbar';
import Footer from '../components/Footer';
import CTASection from '../components/CTASection';

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: "Real-time Alerts",
      description: "Get instant notifications when customers report issues, allowing you to address problems before they become public complaints."
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "QR Code Integration",
      description: "Customers simply scan a QR code at their table to provide feedback. No app downloads or registrations required."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analytics Dashboard",
      description: "Track satisfaction trends, identify problem areas, and measure improvement over time with detailed analytics."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Reputation Protection",
      description: "Prevent negative reviews by catching and resolving issues while customers are still in your venue."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Collaboration",
      description: "Notify the right team members instantly and track issue resolution across your entire staff."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Multi-location Support",
      description: "Manage feedback across multiple venues from a single dashboard with location-specific insights."
    }
  ];

  const stats = [
    { number: "97%", label: "Customer Satisfaction Increase" },
    { number: "85%", label: "Reduction in Negative Reviews" },
    { number: "3min", label: "Average Response Time" },
    { number: "500+", label: "Venues Trust Chatters" }
  ];

  const testimonials = [
    {
      name: "Sarah Mitchell",
      title: "Operations Manager",
      company: "The Riverside Restaurant Group",
      quote: "Chatters has transformed how we handle customer feedback. We've seen a 40% decrease in negative online reviews since implementation.",
      rating: 5
    },
    {
      name: "James Thompson",
      title: "General Manager",
      company: "Heritage Hotels",
      quote: "The real-time alerts have allowed us to turn potentially negative experiences into positive ones. Our customer satisfaction scores have never been higher.",
      rating: 5
    },
    {
      name: "Maria Rodriguez",
      title: "Restaurant Owner",
      company: "Casa Bella",
      quote: "Simple, effective, and powerful. Chatters pays for itself by preventing just one negative review from impacting our reputation.",
      rating: 5
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Customer Scans QR Code",
      description: "Guests scan the QR code at their table using their smartphone camera. No app download required."
    },
    {
      step: "2", 
      title: "Provides Instant Feedback",
      description: "If customers are dissatisfied, they can quickly report issues through our simple feedback form."
    },
    {
      step: "3",
      title: "Team Gets Alerted",
      description: "Your staff receives instant notifications via SMS, email, or app, with details about the issue and table location."
    },
    {
      step: "4",
      title: "Issue Resolved Immediately",
      description: "Address the problem while the customer is still present, turning a potential negative review into a positive experience."
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "£29",
      period: "per month",
      description: "Perfect for single locations",
      features: [
        "Up to 50 tables",
        "Real-time alerts",
        "Basic analytics",
        "Email support",
        "QR code generation"
      ],
      popular: false
    },
    {
      name: "Professional", 
      price: "£79",
      period: "per month",
      description: "Ideal for growing businesses",
      features: [
        "Up to 200 tables",
        "Advanced analytics",
        "Multi-location support",
        "Priority support",
        "Custom branding",
        "API access"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "For large restaurant groups",
      features: [
        "Unlimited tables",
        "White-label solution",
        "Dedicated account manager",
        "Custom integrations",
        "Advanced reporting",
        "SLA guarantee"
      ],
      popular: false
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Chatters",
    "description": "Real-time customer feedback management platform for restaurants, hotels, and hospitality businesses. Prevent negative reviews, improve customer satisfaction, and protect your reputation.",
    "url": "https://getchatters.com",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, iOS, Android",
    "offers": {
      "@type": "Offer",
      "priceCurrency": "GBP",
      "price": "29.00",
      "priceValidUntil": "2025-12-31",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "500",
      "bestRating": "5",
      "worstRating": "1"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Chatters Ltd",
      "url": "https://getchatters.com"
    }
  };

  return (
    <div className="min-h-screen bg-[#082524]">
      <Helmet>
        <title>Chatters - Real-Time Customer Feedback Management | Prevent Bad Reviews for Restaurants & Hotels</title>
        <meta 
          name="description" 
          content="Stop negative reviews before they happen! Chatters provides real-time customer feedback alerts for restaurants, hotels & hospitality businesses. Get instant notifications, improve satisfaction & protect your reputation. Free trial available."
        />
        <meta 
          name="keywords" 
          content="customer feedback software, restaurant feedback management, prevent negative reviews, real-time alerts, hospitality feedback system, customer satisfaction software, restaurant reputation management, hotel feedback platform, QR code feedback, instant customer alerts"
        />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://getchatters.com/" />
        <meta property="og:title" content="Chatters - Real-Time Customer Feedback Management | Prevent Bad Reviews" />
        <meta property="og:description" content="Stop negative reviews before they happen! Get instant customer feedback alerts for restaurants, hotels & hospitality businesses. Improve satisfaction & protect reputation." />
        <meta property="og:image" content="https://getchatters.com/img/chatters-og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Chatters" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://getchatters.com/" />
        <meta property="twitter:title" content="Chatters - Real-Time Customer Feedback Management | Prevent Bad Reviews" />
        <meta property="twitter:description" content="Stop negative reviews before they happen! Get instant customer feedback alerts for restaurants, hotels & hospitality businesses." />
        <meta property="twitter:image" content="https://getchatters.com/img/chatters-twitter-image.jpg" />
        
        {/* Additional SEO Meta Tags */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="google-site-verification" content="your-google-site-verification-code" />
        <meta name="author" content="Chatters Ltd" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#1A535C" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://getchatters.com/" />
        
        {/* Alternate Language Versions */}
        <link rel="alternate" hreflang="en" href="https://getchatters.com/" />
        <link rel="alternate" hreflang="en-US" href="https://getchatters.com/" />
        <link rel="alternate" hreflang="en-GB" href="https://getchatters.com/" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        
        {/* Additional Structured Data for FAQ */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How does Chatters help prevent negative reviews?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Chatters provides real-time alerts when customers report issues, allowing you to address problems immediately while they're still in your venue, before they leave negative reviews online."
                }
              },
              {
                "@type": "Question", 
                "name": "What types of businesses use Chatters?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Chatters is used by restaurants, hotels, bars, cafes, retail stores, and other hospitality businesses to manage customer feedback and improve satisfaction."
                }
              }
            ]
          })}
        </script>
      </Helmet>

      <Navbar />

      {/* Hero Section with Dark Background */}
      <section className="relative min-h-screen flex flex-col justify-center pt-32 pb-16 overflow-hidden" itemScope itemType="https://schema.org/Product">
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex-1 flex flex-col justify-center">
          {/* Main Hero Content */}
          <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6 font-satoshi" itemProp="name">
              Real-Time Customer Feedback Management for
              <span className="text-[#4ECDC4]"> Restaurants & Hotels</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 leading-relaxed font-satoshi max-w-4xl mx-auto" itemProp="description">
              Stop negative reviews before they happen! Chatters provides instant customer feedback alerts for restaurants, hotels, and hospitality businesses. Get real-time notifications when customers are unhappy and resolve issues immediately while they're still in your venue.
            </p>
            
            {/* Key Benefits */}
            <div className="mb-12">
              <ul className="text-lg text-gray-200 space-y-3 font-satoshi max-w-3xl mx-auto">
                <li className="flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-[#4ECDC4] mr-4 flex-shrink-0" />
                  Prevent negative reviews with instant alerts
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-[#4ECDC4] mr-4 flex-shrink-0" />
                  Improve customer satisfaction by 97%
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-[#4ECDC4] mr-4 flex-shrink-0" />
                  QR code feedback system - no app required
                </li>
              </ul>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <a 
                href="/demo" 
                className="group bg-[#4ECDC4] text-[#082524] px-8 py-4 rounded-xl hover:bg-[#3db8b8] transition-all duration-300 flex items-center justify-center font-satoshi font-semibold shadow-lg hover:shadow-xl"
                aria-label="Book a demo of Chatters feedback management software"
              >
                Book a Demo
                <ArrowRight className="ml-2 w-5 h-5 transform transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a 
                href="/pricing" 
                className="group border-2 border-[#4ECDC4] bg-transparent text-white px-8 py-4 rounded-xl hover:bg-[#4ECDC4] hover:text-[#082524] transition-all duration-300 flex items-center justify-center font-satoshi font-semibold"
                aria-label="View pricing for Chatters customer feedback system"
              >
                View Pricing
                <ArrowRight className="ml-2 w-5 h-5 transform transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
              <div className="flex items-center">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4ECDC4] to-[#1A535C] border-2 border-white"></div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1A535C] to-[#4ECDC4] border-2 border-white"></div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4ECDC4] to-[#1A535C] border-2 border-white"></div>
                </div>
                <span className="ml-4 text-sm text-gray-300 font-satoshi font-medium">500+ venues trust Chatters</span>
              </div>
              <div className="flex items-center" itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
                <div className="flex space-x-1">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-[#FFE66D] text-[#FFE66D]" />)}
                </div>
                <span className="ml-3 text-sm text-gray-300 font-satoshi font-medium">
                  <span itemProp="ratingValue">4.9</span>/<span itemProp="bestRating">5</span> from <span itemProp="ratingCount">500</span> reviews
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - SEO Optimized */}
      <section className="py-20 bg-[#F7FFF7]" aria-labelledby="stats-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="stats-heading" className="text-4xl font-bold text-center text-[#1A535C] mb-16 font-satoshi">
            Proven Results for Hospitality Businesses
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 border border-[#4ECDC4]/20">
                  <div className="text-4xl lg:text-5xl font-bold text-[#4ECDC4] mb-3 font-satoshi">{stat.number}</div>
                  <div className="text-[#1A535C] font-satoshi font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - SEO Optimized */}
      <section id="features" className="py-24 bg-white" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-20">
            <h2 id="features-heading" className="text-4xl lg:text-5xl font-bold text-[#1A535C] mb-6 font-satoshi">
              Complete Customer Feedback Management Solution
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#4ECDC4] to-[#FFE66D] mx-auto mb-6 rounded-full"></div>
            <p className="text-xl text-gray-700 max-w-4xl mx-auto font-satoshi leading-relaxed">
              Comprehensive real-time feedback management tools designed specifically for hospitality businesses to prevent negative reviews and improve customer satisfaction
            </p>
          </header>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <article key={index} className="group p-8 rounded-3xl hover:bg-[#F7FFF7] transition-all duration-500 hover:scale-105 border border-transparent hover:border-[#4ECDC4]/30">
                <div className="w-16 h-16 bg-gradient-to-br from-[#4ECDC4] to-[#1A535C] text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-[#1A535C] mb-4 font-satoshi group-hover:text-[#4ECDC4] transition-colors">{feature.title}</h3>
                <p className="text-gray-700 leading-relaxed font-satoshi">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-gradient-to-br from-[#F7FFF7] via-white to-[#F7FFF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#1A535C] mb-6 font-satoshi">How Chatters Works</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#FF6B6B] to-[#FFE66D] mx-auto mb-6 rounded-full"></div>
            <p className="text-xl text-gray-700 font-satoshi">Simple, effective, and immediate</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              {howItWorks.map((step, index) => (
                <div key={index} className="flex items-start space-x-6 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#4ECDC4] to-[#1A535C] text-white rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#1A535C] mb-3 font-satoshi group-hover:text-[#4ECDC4] transition-colors">{step.title}</h3>
                    <p className="text-gray-700 leading-relaxed font-satoshi">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-[#F7FFF7] to-[#4ECDC4]/10 rounded-3xl flex items-center justify-center border-2 border-[#4ECDC4]/20 shadow-xl">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#4ECDC4] to-[#1A535C] rounded-full mx-auto mb-6 flex items-center justify-center">
                    <Smartphone className="w-10 h-10 text-white" />
                  </div>
                  <span className="text-[#1A535C] font-satoshi font-semibold text-lg">Process Flow Visualization</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#1A535C] mb-6 font-satoshi">Trusted by Leading Hospitality Brands</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#4ECDC4] to-[#FF6B6B] mx-auto mb-6 rounded-full"></div>
            <p className="text-xl text-gray-700 font-satoshi">See what our customers say about their results</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-10">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-[#F7FFF7] to-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-[#4ECDC4]/20">
                <div className="flex space-x-1 mb-6">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`w-6 h-6 ${i <= testimonial.rating ? 'fill-[#FFE66D] text-[#FFE66D]' : 'text-gray-300'}`} />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-8 leading-relaxed font-satoshi text-lg">
                  "{testimonial.quote}"
                </blockquote>
                <div className="border-t border-[#4ECDC4]/20 pt-6">
                  <div className="font-bold text-[#1A535C] font-satoshi">{testimonial.name}</div>
                  <div className="text-sm text-gray-600 font-satoshi mt-1">{testimonial.title}, {testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that fits your business needs</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`relative bg-white rounded-2xl shadow-lg p-8 ${plan.popular ? 'ring-2 ring-gray-900 scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-gray-900 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-2">/ {plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <a href="/demo" className={`w-full py-3 px-6 rounded-lg font-semibold text-center block transition-colors ${
                  plan.popular 
                    ? 'bg-gray-900 text-white hover:bg-gray-800' 
                    : 'border border-gray-300 text-gray-700 hover:border-gray-400'
                }`}>
                  {plan.price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section for SEO */}
      <section className="py-24 bg-gradient-to-br from-[#F7FFF7] via-white to-[#F7FFF7]" aria-labelledby="faq-heading">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-20">
            <h2 id="faq-heading" className="text-4xl lg:text-5xl font-bold text-[#1A535C] mb-6 font-satoshi">
              Frequently Asked Questions
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#FFE66D] to-[#FF6B6B] mx-auto mb-6 rounded-full"></div>
            <p className="text-xl text-gray-700 font-satoshi">
              Everything you need to know about Chatters customer feedback management
            </p>
          </header>
          <div className="space-y-8" itemScope itemType="https://schema.org/FAQPage">
            <div className="bg-white rounded-3xl p-10 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#4ECDC4]/20" itemScope itemType="https://schema.org/Question">
              <h3 className="text-xl font-bold text-[#1A535C] mb-6 font-satoshi" itemProp="name">
                How does Chatters help prevent negative reviews for restaurants and hotels?
              </h3>
              <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                <p className="text-gray-700 leading-relaxed font-satoshi text-lg" itemProp="text">
                  Chatters provides real-time alerts when customers report issues through our QR code feedback system. Your staff receives instant notifications via SMS, email, or mobile app, allowing you to address problems immediately while customers are still in your venue, before they leave negative reviews online.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-10 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#4ECDC4]/20" itemScope itemType="https://schema.org/Question">
              <h3 className="text-xl font-bold text-[#1A535C] mb-6 font-satoshi" itemProp="name">
                What types of businesses benefit most from Chatters feedback management?
              </h3>
              <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                <p className="text-gray-700 leading-relaxed font-satoshi text-lg" itemProp="text">
                  Chatters is designed for hospitality businesses including restaurants, hotels, bars, cafes, retail stores, and any venue where customer experience is critical. Our platform works especially well for businesses with multiple locations or high customer turnover.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-10 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#4ECDC4]/20" itemScope itemType="https://schema.org/Question">
              <h3 className="text-xl font-bold text-[#1A535C] mb-6 font-satoshi" itemProp="name">
                How quickly can we implement Chatters at our restaurant or hotel?
              </h3>
              <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                <p className="text-gray-700 leading-relaxed font-satoshi text-lg" itemProp="text">
                  Most businesses are up and running within 24-48 hours. We provide QR code generation, staff training, and complete setup assistance. No technical expertise required - just scan, collect feedback, and start improving customer satisfaction immediately.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-10 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#4ECDC4]/20" itemScope itemType="https://schema.org/Question">
              <h3 className="text-xl font-bold text-[#1A535C] mb-6 font-satoshi" itemProp="name">
                Do customers need to download an app to provide feedback?
              </h3>
              <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                <p className="text-gray-700 leading-relaxed font-satoshi text-lg" itemProp="text">
                  No app download required! Customers simply scan a QR code with their smartphone camera and provide feedback through their mobile browser. This makes it incredibly easy for customers to share their experience without any barriers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 bg-gradient-to-br from-[#1A535C] via-[#4ECDC4] to-[#1A535C] relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 font-satoshi">
            Start Preventing Negative Reviews Today
          </h2>
          <p className="text-xl text-white/90 mb-10 font-satoshi leading-relaxed">
            Join 500+ restaurants, hotels, and hospitality businesses using Chatters to protect their reputation and improve customer satisfaction with real-time feedback management.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a 
              href="/demo" 
              className="bg-[#FF6B6B] text-white px-10 py-5 rounded-2xl text-lg font-bold hover:bg-[#ff5252] transition-all duration-300 hover:scale-105 font-satoshi shadow-2xl hover:shadow-3xl"
            >
              Start Free 14-Day Trial
            </a>
            <a 
              href="/demo" 
              className="bg-white text-[#1A535C] px-10 py-5 rounded-2xl text-lg font-bold hover:bg-[#F7FFF7] transition-all duration-300 font-satoshi shadow-xl hover:shadow-2xl"
            >
              Schedule a Demo
            </a>
          </div>
          <p className="text-white/80 mt-8 font-satoshi">
            No credit card required • Free 14-day trial • Setup in minutes
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;