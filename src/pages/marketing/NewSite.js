import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import CTAButton from '../../components/marketing/common/buttons/CTAButton';

const NewSite = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Chatters</title>
      </Helmet>

      {/* Navbar */}
      <nav className="w-full border-b border-gray-200 font-jakarta">
        <div className="w-full px-[30px] py-4">
          <div className="flex items-center justify-between">
            {/* Left side: Logo + Nav Links */}
            <div className="flex items-center space-x-8">
              {/* Logo - Blue Chat Bubble Placeholder */}
              <Link to="/" className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-[#2F5CFF] flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-6">
                {/* Product Dropdown */}
                <div className="relative">
                  <button
                    onMouseEnter={() => setOpenDropdown('product')}
                    onMouseLeave={() => setOpenDropdown(null)}
                    className="flex items-center gap-1 text-gray-700 hover:text-black transition-colors text-sm font-medium"
                  >
                    Product
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Solutions Dropdown */}
                <div className="relative">
                  <button
                    onMouseEnter={() => setOpenDropdown('solutions')}
                    onMouseLeave={() => setOpenDropdown(null)}
                    className="flex items-center gap-1 text-gray-700 hover:text-black transition-colors text-sm font-medium"
                  >
                    Solutions
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Resources Dropdown */}
                <div className="relative">
                  <button
                    onMouseEnter={() => setOpenDropdown('resources')}
                    onMouseLeave={() => setOpenDropdown(null)}
                    className="flex items-center gap-1 text-gray-700 hover:text-black transition-colors text-sm font-medium"
                  >
                    Resources
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                <Link
                  to="/pricing"
                  className="text-gray-700 hover:text-black transition-colors text-sm font-medium"
                >
                  Pricing
                </Link>
                <Link
                  to="/help"
                  className="text-gray-700 hover:text-black transition-colors text-sm font-medium"
                >
                  Help
                </Link>
              </div>
            </div>

            {/* Right side: CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-3">
              <Link
                to="/login"
                className="text-gray-700 hover:text-black transition-colors text-sm font-medium px-4 py-2"
              >
                Log in
              </Link>
              <CTAButton to="/demo">
                Take a tour
              </CTAButton>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-gray-700"
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
              <div className="space-y-2">
                <button className="w-full text-left text-gray-700 hover:text-black transition-colors text-sm font-medium py-2">
                  Product
                </button>
                <button className="w-full text-left text-gray-700 hover:text-black transition-colors text-sm font-medium py-2">
                  Solutions
                </button>
                <button className="w-full text-left text-gray-700 hover:text-black transition-colors text-sm font-medium py-2">
                  Resources
                </button>
                <Link
                  to="/pricing"
                  className="block text-gray-700 hover:text-black transition-colors text-sm font-medium py-2"
                >
                  Pricing
                </Link>
                <Link
                  to="/help"
                  className="block text-gray-700 hover:text-black transition-colors text-sm font-medium py-2"
                >
                  Help
                </Link>
              </div>
              <div className="pt-3 space-y-2 border-t border-gray-200">
                <Link
                  to="/login"
                  className="block text-gray-700 hover:text-black transition-colors text-sm font-medium py-2"
                >
                  Log in
                </Link>
                <CTAButton to="/demo" className="w-full justify-center">
                  Take a tour
                </CTAButton>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Empty content area */}
      <div className="min-h-[calc(100vh-73px)]">
        {/* Content will go here */}
      </div>
    </div>
  );
};

export default NewSite;
