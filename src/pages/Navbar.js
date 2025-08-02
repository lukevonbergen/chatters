import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Pricing', path: '/pricing' },
    { name: 'Docs', path: 'https://chatters.canny.io/changelog' },
  ];

  const featureLinks = [
    { name: 'Real-time Stats', path: '/features/real-time-stats' },
    { name: 'Dashboards', path: '/features/dashboards' },
    { name: 'Custom Branding', path: '/features/custom-branding' },
    { name: 'QR Codes', path: '/features/qr-codes' },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img src="/img/Logo.svg" alt="Chatters Logo" className="h-8" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex lg:items-center lg:space-x-6 relative">
            {/* Features Dropdown on Hover */}
            <div className="relative group">
              <div className="text-sm font-semibold text-gray-700 hover:text-gray-900 flex items-center cursor-pointer">
                Features <ChevronDown className="ml-1 h-4 w-4" />
              </div>
              <div className="absolute top-full w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200">
                <div className="py-1 pt-2">
                  {featureLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {navLinks.map((link) =>
              link.name === 'Docs' ? (
                <a
                  key={link.name}
                  href={link.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-gray-600 hover:text-gray-900"
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-semibold hover:text-gray-900 ${isActive(link.path) ? 'text-gray-900' : 'text-gray-600'}`}
                >
                  {link.name}
                </Link>
              )
            )}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            <Link to="https://my.getchatters.com/signin" className="bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800">
              Login
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-800 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white shadow-md">
          <div className="px-4 pt-4 pb-6 space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-700">Features</p>
              <div className="mt-2 space-y-2">
                {featureLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-sm text-gray-700 hover:text-gray-900"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
            {navLinks.map((link) =>
              link.name === 'Docs' ? (
                <a
                  key={link.name}
                  href={link.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-gray-700 hover:text-gray-900"
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-sm text-gray-700 hover:text-gray-900"
                >
                  {link.name}
                </Link>
              )
            )}
            <Link to="https://my.getchatters.com/signin" className="block text-sm text-white bg-black px-4 py-2 rounded-md hover:bg-gray-800">
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
