import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Menu, X, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const NewSite = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <Helmet>
        <title>Restaurant Feedback Software UK | Prevent Bad Reviews | Chatters</title>
        <meta
          name="description"
          content="Stop negative reviews before they happen. Chatters provides real-time customer feedback alerts for restaurants, pubs & hotels across the UK. Boost ratings instantly with QR code feedback collection. Free 14-day trial."
        />
      </Helmet>

      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side: Logo + Nav Links */}
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <Link to="/">
                <img src="/img/Logo.svg" alt="Chatters" className="h-8" />
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-6">
                <Link
                  to="/features"
                  className="text-black hover:text-gray-600 transition-colors text-sm font-medium"
                >
                  Features
                </Link>
                <Link
                  to="/pricing"
                  className="text-black hover:text-gray-600 transition-colors text-sm font-medium"
                >
                  Pricing
                </Link>
                <Link
                  to="/help"
                  className="text-black hover:text-gray-600 transition-colors text-sm font-medium"
                >
                  Help
                </Link>
              </div>
            </div>

            {/* Right side: CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-3">
              <Link
                to="/login"
                className="text-black hover:text-gray-600 transition-colors text-sm font-medium"
              >
                Log in
              </Link>
              <Link
                to="/demo"
                className="px-5 py-2.5 rounded-lg bg-[#EEECED] text-black text-sm font-medium transition-all hover:opacity-80 flex items-center gap-1"
              >
                Book a demo
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-black"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 space-y-3 border-t border-gray-200 pt-4">
              <Link
                to="/features"
                className="block text-black hover:text-gray-600 transition-colors text-sm font-medium"
              >
                Features
              </Link>
              <Link
                to="/pricing"
                className="block text-black hover:text-gray-600 transition-colors text-sm font-medium"
              >
                Pricing
              </Link>
              <Link
                to="/help"
                className="block text-black hover:text-gray-600 transition-colors text-sm font-medium"
              >
                Help
              </Link>
              <div className="pt-3 space-y-2 border-t border-gray-200">
                <Link
                  to="/login"
                  className="block text-black hover:text-gray-600 transition-colors text-sm font-medium"
                >
                  Log in
                </Link>
                <Link
                  to="/demo"
                  className="flex items-center justify-center gap-1 px-5 py-2.5 rounded-lg bg-[#EEECED] text-black text-sm font-medium transition-all hover:opacity-80"
                >
                  Book a demo
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <p className="text-xs tracking-widest uppercase font-semibold text-purple-600/80 mb-4">
            Will for hospo
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-6 leading-tight">
            AI-Powered Intelligence That Transforms Feedback Into Action
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed max-w-3xl mx-auto">
            Stop drowning in data. Let AI analyse thousands of customer responses instantly, identify critical trends, and deliver actionable recommendations that drive real business results.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              to="/demo"
              className="px-6 py-3 rounded-lg bg-[#EEECED] text-black text-base font-medium transition-all hover:opacity-80 flex items-center gap-2"
            >
              Book a demo
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/pricing"
              className="px-6 py-3 rounded-lg bg-[#EEECED] text-black text-base font-medium transition-all hover:opacity-80 flex items-center gap-2"
            >
              Pricing
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Feature bullets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700 max-w-xl mx-auto">
            {[
              "Alerts direct to staff",
              "Boost revenue & ratings",
              "Multi-location control",
              "Improve customer retention"
            ].map((item) => (
              <div key={item} className="flex items-center justify-center gap-2">
                <span className="inline-flex p-1 rounded-full bg-green-100 text-green-700">
                  <Check className="w-4 h-4" />
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="w-full px-6 py-16">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Real-Time Feedback Resolution */}
          <div className="rounded-2xl p-8 md:p-10 bg-[#EEECED]">
            <h3 className="text-xl md:text-2xl text-black mb-3 font-medium">
              Real-Time Restaurant Feedback Resolution
            </h3>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              Monitor guest satisfaction in real-time with instant staff alerts. Chatters helps UK restaurants respond to customer feedback in real-time, preventing negative TripAdvisor reviews before they happen.
            </p>
          </div>

          {/* Prevent Negative Reviews */}
          <div className="rounded-2xl p-8 md:p-10 bg-[#EEECED]">
            <h3 className="text-xl md:text-2xl text-black mb-3 font-medium">
              Prevent Negative Restaurant Reviews
            </h3>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              Capture guest concerns at the table before they become online complaints. Our QR code feedback system helps UK pubs and restaurants maintain 5-star ratings across Google and TripAdvisor.
            </p>
          </div>

          {/* Multi-Location Management */}
          <div className="rounded-2xl p-8 md:p-10 bg-[#EEECED]">
            <h3 className="text-xl md:text-2xl text-black mb-3 font-medium">
              Multi-Location Restaurant Management
            </h3>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              Optimise staffing across your restaurant group with real-time guest feedback analytics. Compare performance between venues and identify operational trends to improve customer satisfaction.
            </p>
          </div>

          {/* Intelligent Analytics */}
          <div className="rounded-2xl p-8 md:p-10 bg-[#EEECED]">
            <h3 className="text-xl md:text-2xl text-black mb-3 font-medium">
              Intelligent Guest Sentiment Analytics
            </h3>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              AI-powered insights help you understand customer sentiment, identify patterns, and make data-driven decisions that improve service quality and guest satisfaction.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full px-6 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs tracking-widest uppercase font-semibold text-purple-600/80 mb-3">
              Testimonials
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              UK Restaurant Teams Prevent Bad Reviews with Chatters
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Real feedback from UK pub managers, restaurant operators, and hotel teams using our guest feedback software daily.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                quote: "We catch unhappy guests instantly instead of reading it on TripAdvisor the next day.",
                author: "Laura Hughes",
                role: "GM, The King's Arms"
              },
              {
                quote: "Chatters has become part of our daily ops—our team check it like they check tickets.",
                author: "Marcus Doyle",
                role: "Ops Manager, Brew & Co."
              },
              {
                quote: "We stopped over 50 potential one-star reviews in the first six weeks.",
                author: "Emma Walsh",
                role: "Owner, The Dockside"
              },
              {
                quote: "Staff love it—alerts pop up and they fix problems on the spot.",
                author: "Ryan Turner",
                role: "Floor Manager, Copperhouse Pub"
              },
              {
                quote: "We've never had a simpler system roll out—no training, just scan and go.",
                author: "Helen Carter",
                role: "Ops Director, Urban Taverns"
              },
              {
                quote: "Our service scores jumped within a month of using Chatters.",
                author: "James O'Neill",
                role: "Owner, The White Hart"
              }
            ].map((testimonial, index) => (
              <div key={index} className="rounded-2xl p-6 bg-[#EEECED]">
                <p className="text-gray-800 mb-4 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-semibold text-black">{testimonial.author}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Ready to Prevent Negative Restaurant Reviews?
          </h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Join hundreds of UK restaurants, pubs, and hotels already using Chatters to improve guest satisfaction and protect their online reputation. Start your free 14-day trial today.
          </p>
          <Link
            to="/demo"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-[#EEECED] text-black text-base font-medium transition-all hover:opacity-80"
          >
            Book a Demo
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full px-6 py-16 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs tracking-widest uppercase font-semibold text-purple-600/80 mb-3">
              Chatters FAQ
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Everything you need to know
            </h2>
            <p className="text-lg text-gray-700">
              If you have a different question, contact us and we'll help.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "How does restaurant feedback software prevent negative TripAdvisor reviews?",
                a: "Chatters captures guest concerns in real-time via QR codes at tables, alerting staff instantly so issues can be resolved before guests leave. This proactive approach prevents most negative reviews from ever being posted online."
              },
              {
                q: "What's the best customer feedback system for UK pub chains?",
                a: "Chatters is designed specifically for UK hospitality groups, offering multi-location management, role-based access for area managers, and real-time analytics across all venues from a single dashboard."
              },
              {
                q: "Can restaurant feedback software integrate with our existing POS system?",
                a: "Yes, Chatters integrates with major UK POS systems including Epos Now, TouchBistro, and Square. Our QR code system works independently while syncing valuable guest data with your existing operations."
              },
              {
                q: "How quickly do staff receive feedback alerts in busy restaurants?",
                a: "Staff receive push notifications within 10 seconds of guest submission. Alerts are prioritised by severity, ensuring critical issues reach managers immediately whilst routine requests go to floor staff."
              }
            ].map((faq, index) => (
              <div key={index} className="rounded-2xl p-6 bg-[#EEECED]">
                <h3 className="text-lg font-semibold text-black mb-2">
                  {faq.q}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full px-6 py-12 bg-[#EEECED]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <img src="/img/Logo.svg" alt="Chatters" className="h-8 mb-4" />
              <p className="text-sm text-gray-600">
                Real-time customer feedback platform for UK hospitality.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-black mb-4">Product</h4>
              <div className="space-y-2">
                <Link to="/features" className="block text-sm text-gray-600 hover:text-black">Features</Link>
                <Link to="/pricing" className="block text-sm text-gray-600 hover:text-black">Pricing</Link>
                <Link to="/demo" className="block text-sm text-gray-600 hover:text-black">Book a Demo</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-black mb-4">Support</h4>
              <div className="space-y-2">
                <Link to="/help" className="block text-sm text-gray-600 hover:text-black">Help Center</Link>
                <Link to="/contact" className="block text-sm text-gray-600 hover:text-black">Contact</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-black mb-4">Legal</h4>
              <div className="space-y-2">
                <Link to="/privacy" className="block text-sm text-gray-600 hover:text-black">Privacy</Link>
                <Link to="/terms" className="block text-sm text-gray-600 hover:text-black">Terms</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-300 pt-8">
            <p className="text-sm text-gray-600 text-center">
              © {new Date().getFullYear()} Chatters Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NewSite;
