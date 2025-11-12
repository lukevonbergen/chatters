import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Menu, X } from 'lucide-react';

const NewSite = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F9F9' }}>
      <Helmet>
        <title>Chatters - AI-Powered Intelligence That Transforms Feedback Into Action</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side: Logo + Nav Links */}
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <img src="/img/Logo.svg" alt="Chatters" className="h-8" />

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-6">
                <a
                  href="#"
                  className="text-black hover:text-gray-600 transition-colors text-sm font-medium"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Product
                </a>
                <a
                  href="#"
                  className="text-black hover:text-gray-600 transition-colors text-sm font-medium"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Solutions
                </a>
                <a
                  href="#"
                  className="text-black hover:text-gray-600 transition-colors text-sm font-medium"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Resources
                </a>
                <a
                  href="#"
                  className="text-black hover:text-gray-600 transition-colors text-sm font-medium"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Pricing
                </a>
                <a
                  href="#"
                  className="text-black hover:text-gray-600 transition-colors text-sm font-medium"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Help
                </a>
              </div>
            </div>

            {/* Right side: CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-3">
              <a
                href="#"
                className="text-black hover:text-gray-600 transition-colors text-sm font-medium"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Log in
              </a>
              <a
                href="#"
                className="px-5 py-2.5 rounded-lg text-black text-sm font-medium transition-all hover:opacity-80 flex items-center gap-1"
                style={{
                  backgroundColor: '#EEECED',
                  fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}
              >
                Take a tour
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
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
              <a
                href="#"
                className="block text-black hover:text-gray-600 transition-colors text-sm font-medium"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Product
              </a>
              <a
                href="#"
                className="block text-black hover:text-gray-600 transition-colors text-sm font-medium"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Solutions
              </a>
              <a
                href="#"
                className="block text-black hover:text-gray-600 transition-colors text-sm font-medium"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Resources
              </a>
              <a
                href="#"
                className="block text-black hover:text-gray-600 transition-colors text-sm font-medium"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Pricing
              </a>
              <a
                href="#"
                className="block text-black hover:text-gray-600 transition-colors text-sm font-medium"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Help
              </a>
              <div className="pt-3 space-y-2 border-t border-gray-200">
                <a
                  href="#"
                  className="block text-black hover:text-gray-600 transition-colors text-sm font-medium"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Log in
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center gap-1 px-5 py-2.5 rounded-lg text-black text-sm font-medium transition-all hover:opacity-80"
                  style={{
                    backgroundColor: '#EEECED',
                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                  }}
                >
                  Take a tour
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6 leading-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            AI-Powered intelligence that transforms feedback into action
          </h1>
          <p
            className="text-lg md:text-xl text-black mb-8 leading-relaxed max-w-3xl mx-auto"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400 }}
          >
            Stop drowning in data. Let AI analyse thousands of customer responses instantly, identify critical trends, and deliver actionable recommendations that drive real business results.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#"
              className="px-6 py-3 rounded-lg text-black text-base font-medium transition-all hover:opacity-80 flex items-center gap-1"
              style={{
                backgroundColor: '#EEECED',
                fontFamily: "'Plus Jakarta Sans', sans-serif"
              }}
            >
              Pricing
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href="#"
              className="px-6 py-3 rounded-lg text-black text-base font-medium transition-all hover:opacity-80 flex items-center gap-1"
              style={{
                backgroundColor: '#EEECED',
                fontFamily: "'Plus Jakarta Sans', sans-serif"
              }}
            >
              Take a tour
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chatters Intelligence Card */}
          <div
            className="rounded-2xl p-8 md:p-10 text-center"
            style={{ backgroundColor: '#EEECED' }}
          >
            <h3
              className="text-2xl md:text-3xl text-black mb-4"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 }}
            >
              Chatters Intelligence
            </h3>
            <p
              className="text-base md:text-lg text-black leading-relaxed"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400 }}
            >
              Find out in real time, what's wrong mid-service, and fix it.
            </p>
          </div>

          {/* Instant Alerting Card */}
          <div
            className="rounded-2xl p-8 md:p-10 text-center"
            style={{ backgroundColor: '#EEECED' }}
          >
            <h3
              className="text-2xl md:text-3xl text-black mb-4"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 }}
            >
              Instant Alerting
            </h3>
            <p
              className="text-base md:text-lg text-black leading-relaxed"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400 }}
            >
              Alert staff immediately as soon as something's wrong.
            </p>
          </div>

          {/* Employee Performance Reports Card */}
          <div
            className="rounded-2xl p-8 md:p-10 text-center"
            style={{ backgroundColor: '#EEECED' }}
          >
            <h3
              className="text-2xl md:text-3xl text-black mb-4"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 }}
            >
              Employee Performance Reports
            </h3>
            <p
              className="text-base md:text-lg text-black leading-relaxed"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400 }}
            >
              Know how your staff are performing, and when.
            </p>
          </div>

          {/* Operation Management Card */}
          <div
            className="rounded-2xl p-8 md:p-10 text-center"
            style={{ backgroundColor: '#EEECED' }}
          >
            <h3
              className="text-2xl md:text-3xl text-black mb-4"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 }}
            >
              Operation Management
            </h3>
            <p
              className="text-base md:text-lg text-black leading-relaxed"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400 }}
            >
              Manage your real-time operations using smart tools, built for anyone.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Spacing */}
      <div className="h-20"></div>
    </div>
  );
};

export default NewSite;
