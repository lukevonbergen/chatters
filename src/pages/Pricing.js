import React from 'react';
import { Helmet } from 'react-helmet';
import Navbar from './Navbar';
import Footer from '../components/Footer';
import CTASection from '../components/CTASection';

const PricingPage = () => {
  const plans = [
    {
      name: "Starter",
      description: "Perfect for single location businesses",
      features: [
        "Up to 50 feedback collection points",
        "Real-time notifications via SMS & email",
        "Basic analytics dashboard",
        "Customer feedback management",
        "QR code generation",
        "Email support",
        "Mobile app access"
      ],
      highlight: false
    },
    {
      name: "Professional",
      description: "Ideal for growing hospitality businesses",
      features: [
        "Up to 200 feedback collection points",
        "Advanced analytics & reporting",
        "Multi-location management",
        "Custom branding & white-labeling",
        "Priority support",
        "API access & integrations",
        "Staff performance insights",
        "Automated workflows"
      ],
      highlight: true
    },
    {
      name: "Enterprise",
      description: "For large hospitality groups and chains",
      features: [
        "Unlimited feedback collection points",
        "Dedicated account manager",
        "Custom integrations & development",
        "Advanced security & compliance",
        "SLA guarantees",
        "Onboarding & training",
        "Custom reporting & analytics",
        "24/7 priority support"
      ],
      highlight: false
    }
  ];

  const features = [
    {
      category: "Core Features",
      items: [
        "Real-time customer feedback collection",
        "Instant SMS and email notifications",
        "QR code generation and management",
        "Customer sentiment analysis",
        "Issue resolution tracking",
        "Mobile app for staff"
      ]
    },
    {
      category: "Analytics & Reporting",
      items: [
        "Customer satisfaction dashboards",
        "Trend analysis and insights",
        "Performance metrics tracking",
        "Custom report generation",
        "Data export capabilities",
        "Historical data analysis"
      ]
    },
    {
      category: "Management Tools",
      items: [
        "Multi-location support",
        "Staff user management",
        "Role-based permissions",
        "Workflow automation",
        "Integration capabilities",
        "API access"
      ]
    },
    {
      category: "Customization",
      items: [
        "Custom branding options",
        "White-label solutions",
        "Personalized feedback forms",
        "Custom notification settings",
        "Branded customer experience",
        "Tailored onboarding"
      ]
    }
  ];

  const faqs = [
    {
      question: "How is pricing determined?",
      answer: "Our pricing is based on your specific needs including number of locations, expected feedback volume, required integrations, and support level. We create custom packages to ensure you only pay for what you need."
    },
    {
      question: "Is there a free trial available?",
      answer: "Yes! We offer a 14-day free trial with full access to our platform so you can experience the value before making a commitment. No credit card required to start."
    },
    {
      question: "What's included in setup and onboarding?",
      answer: "All plans include complete setup assistance, staff training, QR code generation, and initial configuration. Enterprise plans include dedicated onboarding specialists and custom training programs."
    },
    {
      question: "Are there any hidden fees or contracts?",
      answer: "No hidden fees, ever. Our pricing is transparent and includes all features in your selected plan. We offer both monthly and annual billing options with no long-term contracts required."
    },
    {
      question: "How quickly can we get started?",
      answer: "Most businesses are up and running within 24-48 hours. Our team handles the technical setup while you focus on your business. Enterprise implementations typically take 1-2 weeks."
    },
    {
      question: "What kind of support do you provide?",
      answer: "All plans include comprehensive support via email and phone. Professional plans get priority support, while Enterprise customers receive dedicated account management and 24/7 support."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Pricing Plans | Chatters - Custom Feedback Management Solutions</title>
        <meta 
          name="description" 
          content="Discover Chatters pricing plans designed for your business needs. Get custom quotes for our feedback management platform with flexible pricing and no hidden fees."
        />
        <meta 
          name="keywords" 
          content="feedback management pricing, customer feedback software cost, restaurant feedback pricing, hospitality software plans"
        />
        <meta property="og:title" content="Pricing Plans | Chatters" />
        <meta property="og:description" content="Flexible pricing plans for businesses of all sizes. Get a custom quote for our feedback management platform." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://getchatters.com/pricing" />
      </Helmet>

      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 lg:pt-32 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl lg:text-6xl font-bold text-black leading-tight mb-6 font-satoshi">
              Flexible Pricing for
              <span className="text-[#1A535C]"> Every Business</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed font-satoshi">
              Choose the plan that fits your business needs. All plans include our core feedback management features 
              with scalable options as you grow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/demo" 
                className="bg-[#1A535C] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#144449] transition-all duration-200 font-satoshi"
              >
                Get Custom Quote
              </a>
              <a 
                href="/demo" 
                className="border-2 border-gray-300 text-black px-8 py-4 rounded-lg text-lg font-semibold hover:border-[#1A535C] hover:text-[#1A535C] transition-all duration-200 font-satoshi"
              >
                Start Free Trial
              </a>
            </div>
            <p className="text-sm text-gray-500 mt-4 font-satoshi">
              14-day free trial • No credit card required • Custom pricing available
            </p>
          </div>
        </div>
      </section>

      {/* Plans Overview Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4 font-satoshi">
              Plans Designed for Your Success
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-satoshi">
              From single locations to enterprise chains, we have the right solution for your business size and needs.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`bg-white rounded-2xl shadow-sm p-8 relative ${
                  plan.highlight ? 'ring-2 ring-[#1A535C] scale-105' : ''
                }`}
              >
                {plan.highlight && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-[#1A535C] text-white px-4 py-1 rounded-full text-sm font-semibold font-satoshi">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-black mb-2 font-satoshi">{plan.name}</h3>
                  <p className="text-gray-600 mb-6 font-satoshi">{plan.description}</p>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#1A535C] mb-2 font-satoshi">Custom</div>
                    <div className="text-gray-600 font-satoshi">Get a personalized quote</div>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg className="w-5 h-5 text-[#1A535C] mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 font-satoshi">{feature}</span>
                    </li>
                  ))}
                </ul>
                <a 
                  href="/demo" 
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-center block transition-colors font-satoshi ${
                    plan.highlight 
                      ? 'bg-[#1A535C] text-white hover:bg-[#144449]' 
                      : 'border-2 border-gray-300 text-black hover:border-[#1A535C] hover:text-[#1A535C]'
                  }`}
                >
                  Get Quote
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4 font-satoshi">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-satoshi">
              Comprehensive features across all plans, with advanced capabilities available for larger businesses.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((category, index) => (
              <div key={index} className="space-y-6">
                <h3 className="text-xl font-semibold text-black font-satoshi">{category.category}</h3>
                <ul className="space-y-3">
                  {category.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <svg className="w-4 h-4 text-[#1A535C] mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-600 font-satoshi text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-black mb-6 font-satoshi">
              Why Choose Chatters?
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#1A535C] mb-2 font-satoshi">ROI</div>
                <div className="text-lg font-semibold text-black mb-2 font-satoshi">Proven Return</div>
                <div className="text-gray-600 font-satoshi">Average 3x ROI within the first month through improved customer retention</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#1A535C] mb-2 font-satoshi">24h</div>
                <div className="text-lg font-semibold text-black mb-2 font-satoshi">Quick Setup</div>
                <div className="text-gray-600 font-satoshi">Get up and running in under 24 hours with our dedicated setup team</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#1A535C] mb-2 font-satoshi">500+</div>
                <div className="text-lg font-semibold text-black mb-2 font-satoshi">Happy Customers</div>
                <div className="text-gray-600 font-satoshi">Join hundreds of businesses already protecting their reputation</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4 font-satoshi">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 font-satoshi">
              Everything you need to know about our pricing and plans.
            </p>
          </div>
          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8">
                <h3 className="text-xl font-semibold text-black mb-4 font-satoshi">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed font-satoshi">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection 
        title="Ready to Get Your Custom Quote?"
        description="Every business is unique. Let's create a pricing plan that fits your specific needs and budget."
        primaryButtonText="Get Custom Quote"
        secondaryButtonText="Start Free Trial"
        secondaryButtonLink="/demo"
      />

      <Footer />
    </div>
  );
};

export default PricingPage;
