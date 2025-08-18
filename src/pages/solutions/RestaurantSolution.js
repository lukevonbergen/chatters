import React from 'react';
import { Helmet } from 'react-helmet';
import { ArrowRight } from 'lucide-react';
import Navbar from '../Navbar';
import Footer from '../../components/Footer';
import CTASection from '../../components/CTASection';

const RestaurantSolution = () => {
  const benefits = [
    {
      title: "Prevent Negative Reviews",
      description: "Catch customer concerns before they leave your restaurant and turn potential negative reviews into positive experiences."
    },
    {
      title: "Improve Service Quality",
      description: "Get real-time feedback about food quality, service speed, and staff performance to continuously improve your operations."
    },
    {
      title: "Increase Customer Retention",
      description: "Show customers you care about their experience by addressing issues immediately, building loyalty and encouraging repeat visits."
    },
    {
      title: "Staff Performance Insights",
      description: "Identify top-performing staff and areas for improvement with detailed feedback analytics and reporting."
    },
    {
      title: "Operational Efficiency",
      description: "Streamline issue resolution with instant notifications to managers and staff, reducing response times and improving efficiency."
    },
    {
      title: "Revenue Protection",
      description: "Protect your restaurant's reputation and revenue by maintaining high customer satisfaction scores and positive online reviews."
    }
  ];

  const features = [
    {
      title: "Table-Side QR Code Feedback",
      description: "Customers scan QR codes at their table to provide instant feedback about their dining experience."
    },
    {
      title: "Real-Time Staff Alerts",
      description: "Kitchen staff, servers, and managers receive immediate notifications when customers report issues."
    },
    {
      title: "Sentiment Analysis Dashboard",
      description: "Track customer satisfaction trends, identify peak complaint times, and monitor service quality metrics."
    },
    {
      title: "Issue Resolution Tracking",
      description: "Monitor how quickly your team responds to customer concerns and track resolution success rates."
    },
    {
      title: "Multi-Location Management",
      description: "Manage feedback across multiple restaurant locations from a single dashboard with location-specific insights."
    },
    {
      title: "Staff Training Insights",
      description: "Identify training opportunities based on recurring feedback themes and service quality metrics."
    }
  ];

  const testimonials = [
    {
      quote: "Since implementing Chatters, we've seen a 45% reduction in negative online reviews. We can now address customer concerns while they're still dining with us.",
      author: "Maria Rodriguez",
      title: "Owner, Casa Bella Restaurant",
      result: "45% fewer negative reviews"
    },
    {
      quote: "The real-time alerts have transformed our service quality. Our team can respond to issues immediately, and customer satisfaction scores have never been higher.",
      author: "James Chen",
      title: "General Manager, The Garden Bistro",
      result: "92% customer satisfaction"
    },
    {
      quote: "Chatters pays for itself. By preventing just one negative review from impacting our reputation, we've already seen ROI. It's an essential tool for any restaurant.",
      author: "Sarah Mitchell",
      title: "Operations Director, Harbor View Restaurant Group",
      result: "3x ROI in first month"
    }
  ];

  return (
    <div className="min-h-screen bg-[#082524]">
      <Helmet>
        <title>Restaurant Feedback Management | Chatters - Prevent Bad Reviews</title>
        <meta 
          name="description" 
          content="Transform your restaurant's customer experience with Chatters. Get instant feedback, prevent negative reviews, and improve service quality with real-time alerts and analytics."
        />
        <meta 
          name="keywords" 
          content="restaurant feedback software, prevent negative reviews, customer satisfaction, restaurant management, real-time alerts, dining experience"
        />
        <meta property="og:title" content="Restaurant Feedback Management | Chatters" />
        <meta property="og:description" content="Get instant customer feedback and prevent negative reviews with Chatters restaurant feedback management platform." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://getchatters.com/solutions/restaurants" />
      </Helmet>

      <Navbar />

      {/* Hero Section with Dark Background */}
      <section className="relative bg-[#082524] pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 font-satoshi">
              Restaurant Feedback Management That
              <span className="text-[#4ECDC4]"> Prevents Bad Reviews</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 leading-relaxed font-satoshi">
              Give your restaurant the power to catch customer concerns before they leave your establishment. 
              Turn potential negative reviews into positive experiences with real-time feedback management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/demo" 
                className="group bg-[#4ECDC4] text-[#082524] px-8 py-4 rounded-xl text-lg font-semibold hover:bg-[#3db8b8] transition-all duration-300 font-satoshi shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                Book a Demo
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

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4 font-satoshi">
              Why Restaurants Choose Chatters
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-satoshi">
              Join hundreds of restaurants using Chatters to improve customer satisfaction, 
              protect their reputation, and increase revenue.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
                <h3 className="text-xl font-semibold text-black mb-4 font-satoshi">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed font-satoshi">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4 font-satoshi">
              Powerful Features for Restaurant Success
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-satoshi">
              Everything you need to manage customer feedback and improve your restaurant's operations.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col">
                <h3 className="text-2xl font-semibold text-black mb-4 font-satoshi">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed font-satoshi text-lg">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4 font-satoshi">
              Trusted by Restaurant Owners Everywhere
            </h2>
            <p className="text-xl text-gray-600 font-satoshi">
              See how restaurants are using Chatters to transform their customer experience.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm">
                <blockquote className="text-gray-700 mb-6 leading-relaxed font-satoshi text-lg">
                  "{testimonial.quote}"
                </blockquote>
                <div className="border-t pt-6">
                  <div className="font-semibold text-black font-satoshi">{testimonial.author}</div>
                  <div className="text-gray-600 font-satoshi mb-2">{testimonial.title}</div>
                  <div className="text-[#1A535C] font-semibold font-satoshi">{testimonial.result}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-black mb-4 font-satoshi">
              Restaurant Industry Results
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-[#1A535C] mb-2 font-satoshi">97%</div>
              <div className="text-gray-600 font-satoshi">Customer Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-[#1A535C] mb-2 font-satoshi">45%</div>
              <div className="text-gray-600 font-satoshi">Fewer Negative Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-[#1A535C] mb-2 font-satoshi">2min</div>
              <div className="text-gray-600 font-satoshi">Average Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-[#1A535C] mb-2 font-satoshi">300+</div>
              <div className="text-gray-600 font-satoshi">Restaurants Trust Us</div>
            </div>
          </div>
        </div>
      </section>

      <CTASection 
        title="Ready to Transform Your Restaurant?"
        description="Join hundreds of restaurants using Chatters to improve customer satisfaction and protect their reputation."
        primaryButtonText="Book a Demo"
        secondaryButtonText="View Pricing"
        secondaryButtonLink="/pricing"
      />

      <Footer />
    </div>
  );
};

export default RestaurantSolution;