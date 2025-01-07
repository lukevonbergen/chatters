import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Link to="/">
                <img
                  src="/img/getchatter_logo.svg" // Path to your logo in the public folder
                  alt="Chatter Logo"
                  className="h-8" // Adjust the height as needed
                />
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              Turn customer feedback into actionable insights. Automate collection, analyse sentiment, and make data-driven decisions in real-time.
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Product</h3>
            <ul className="space-y-2">
              <li><Link to="/features" className="text-sm text-gray-500 hover:text-gray-900">Features</Link></li>
              <li><Link to="/pricing" className="text-sm text-gray-500 hover:text-gray-900">Pricing</Link></li>
              <li><Link to="/docs" className="text-sm text-gray-500 hover:text-gray-900">Documentation</Link></li>
              <li><Link to="/demo" className="text-sm text-gray-500 hover:text-gray-900">Demo</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-gray-500 hover:text-gray-900">About Us</Link></li>
              <li><Link to="/careers" className="text-sm text-gray-300 hover:text-gray-300 cursor-not-allowed">Careers</Link></li>
              <li><Link to="/blog" className="text-sm text-gray-300 hover:text-gray-300 cursor-not-allowed">Blog</Link></li>
              <li><Link to="/contact" className="text-sm text-gray-500 hover:text-gray-900">Contact</Link></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-sm text-gray-500 hover:text-gray-900">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-gray-500 hover:text-gray-900">Terms of Service</Link></li>
              <li><Link to="/security" className="text-sm text-gray-500 hover:text-gray-900">Security</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright Notice */}
        <div className="border-t border-gray-100 mt-8 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Feedie.app. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;