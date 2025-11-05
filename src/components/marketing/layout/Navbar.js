// components/marketing/layout/Navbar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, BarChart3, Utensils, Building, ShoppingBag, Calendar, BookOpen, HelpCircle, FileText, GraduationCap, Trophy, Globe, Monitor, Bell, TrendingUp } from 'lucide-react';
import PrimaryButton from '../common/buttons/PrimaryButton';
import { getDashboardUrl, isDevSite } from '../../../utils/domainUtils';

const Navbar = ({ overlay = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownTimer, setDropdownTimer] = useState(null);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const productLinks = [
    { name: 'Question Management', path: '/product/question-management', description: 'Custom feedback forms and intelligent question flows', icon: <HelpCircle className="w-5 h-5" /> },
    { name: 'Business Intelligence', path: '/product/business-intelligence', description: 'Advanced analytics and performance insights', icon: <BarChart3 className="w-5 h-5" /> },
    { name: 'Staff Leaderboard', path: '/product/staff-leaderboard', description: 'Track and celebrate team performance achievements', icon: <Trophy className="w-5 h-5" /> },
    { name: 'Staff Recognition', path: '/product/staff-recognition', description: 'Reward top performers with automated recognition emails', icon: <Trophy className="w-5 h-5" /> },
    { name: 'NPS Scoring', path: '/product/nps-scoring', description: 'Track Net Promoter Score and customer loyalty metrics', icon: <TrendingUp className="w-5 h-5" /> },
    { name: 'Multi-Location Control', path: '/product/multi-location-control', description: 'Centralised management for restaurant/hotel chains', icon: <Globe className="w-5 h-5" /> },
    { name: 'Kiosk Mode', path: '/product/kiosk-mode', description: 'Tablet-based feedback stations and self-service', icon: <Monitor className="w-5 h-5" /> },
    { name: 'Real-Time Alerts', path: '/product/real-time-alerts', description: 'Instant notifications and emergency escalation', icon: <Bell className="w-5 h-5" /> },
  ];

  const solutionsLinks = [
    { name: 'Restaurants', path: '/solutions/restaurants', description: 'Optimise dining experiences', icon: <Utensils className="w-5 h-5" /> },
    { name: 'Hotels', path: '/solutions/hotels', description: 'Enhance guest satisfaction', icon: <Building className="w-5 h-5" /> },
    { name: 'Retail', path: '/solutions/retail', description: 'Improve customer service', icon: <ShoppingBag className="w-5 h-5" /> },
    { name: 'Events', path: '/solutions/events', description: 'Perfect event feedback', icon: <Calendar className="w-5 h-5" /> },
  ];

  const resourcesLinks = [
    { name: 'Documentation', path: 'https://chatters.canny.io/changelog', description: 'Learn how to use Chatters', icon: <BookOpen className="w-5 h-5" /> },
    { name: 'Help Center', path: '/help', description: 'Get support when you need it', icon: <HelpCircle className="w-5 h-5" /> },
    { name: 'Blog', path: '/blog', description: 'Industry insights and tips', icon: <FileText className="w-5 h-5" /> },
  ];

  const handleDropdownEnter = (dropdown) => {
    if (dropdownTimer) {
      clearTimeout(dropdownTimer);
      setDropdownTimer(null);
    }
    setActiveDropdown(dropdown);
  };

  const handleDropdownLeave = () => {
    const timer = setTimeout(() => setActiveDropdown(null), 150);
    setDropdownTimer(timer);
  };

  const handleDropdownContentEnter = () => {
    if (dropdownTimer) {
      clearTimeout(dropdownTimer);
      setDropdownTimer(null);
    }
  };

  const handleDropdownContentLeave = () => {
    const timer = setTimeout(() => setActiveDropdown(null), 150);
    setDropdownTimer(timer);
  };

  const DropdownContent = ({ links, isVisible, colorScheme = 'green' }) => {
    const getColorClasses = () => {
      switch (colorScheme) {
        case 'purple':
          return { bg: 'bg-purple-100', text: 'text-purple-600', hover: 'group-hover:bg-purple-600' };
        case 'blue':
          return { bg: 'bg-blue-100', text: 'text-blue-600', hover: 'group-hover:bg-blue-600' };
        default:
          return { bg: 'bg-green-100', text: 'text-green-600', hover: 'group-hover:bg-green-600' };
      }
    };
    const colors = getColorClasses();

    return (
      <div
        className={`fixed left-4 right-4 top-20 z-[60] transition-all duration-400 ease-out transform ${
          isVisible ? 'opacity-100 visible translate-y-0 scale-100' : 'opacity-0 invisible -translate-y-4 scale-95'
        }`}
        onMouseEnter={handleDropdownContentEnter}
        onMouseLeave={handleDropdownContentLeave}
      >
        <div className="max-w-[1400px] mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 py-4 px-4">
          <div className="grid grid-cols-2 gap-2">
            {links.map((link) =>
              link.path.startsWith('http') ? (
                <a
                  key={link.name}
                  href={link.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start space-x-2.5 p-2.5 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all duration-200"
                  onClick={() => setActiveDropdown(null)}
                >
                  <div className={`flex-shrink-0 w-8 h-8 ${colors.bg} rounded-lg flex items-center justify-center ${colors.text} ${colors.hover} group-hover:text-white transition-all duration-200`}>
                    {link.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-satoshi font-semibold text-black transition-colors duration-200 text-sm">
                      {link.name}
                    </div>
                    <div className="mt-0.5 text-xs text-gray-600 font-satoshi leading-snug">
                      {link.description}
                    </div>
                  </div>
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  className="group flex items-start space-x-2.5 p-2.5 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all duration-200"
                  onClick={() => setActiveDropdown(null)}
                >
                  <div className={`flex-shrink-0 w-8 h-8 ${colors.bg} rounded-lg flex items-center justify-center ${colors.text} ${colors.hover} group-hover:text-white transition-all duration-200`}>
                    {link.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-satoshi font-semibold text-black transition-colors duration-200 text-sm">
                      {link.name}
                    </div>
                    <div className="mt-0.5 text-xs text-gray-600 font-satoshi leading-snug">
                      {link.description}
                    </div>
                  </div>
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <nav className={overlay ? 'fixed top-0 inset-x-0 z-50 font-satoshi' : 'sticky top-0 z-50 font-satoshi p-4'}>
      <div className={overlay ? 'mx-auto max-w-[1400px] px-4' : 'max-w-[1400px] mx-auto bg-white rounded-2xl shadow-lg border border-gray-200'}>
        <div className={overlay ? 'mt-4 rounded-2xl border border-gray-200/60 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50' : ''}>
          <div className="flex justify-between items-center h-16 px-6">
            {/* Left: Logo + Desktop Nav */}
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex-shrink-0">
                <img src={isDevSite() ? "/img/CTS_DEV_LOGO.svg" : "/img/Logo.svg"} alt="Chatters Logo" className="h-8" />
              </Link>

              <div className="hidden lg:flex lg:items-center lg:space-x-8 relative">
                <div
                  className="relative"
                  onMouseEnter={() => handleDropdownEnter('product')}
                  onMouseLeave={handleDropdownLeave}
                >
                  <div className="text-sm font-semibold text-black hover:text-green-600 flex items-center cursor-pointer transition-colors duration-200 font-satoshi">
                    Product <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${activeDropdown === 'product' ? 'rotate-180' : ''}`} />
                  </div>
                  <DropdownContent links={productLinks} isVisible={activeDropdown === 'product'} colorScheme="green" />
                </div>

                <div
                  className="relative"
                  onMouseEnter={() => handleDropdownEnter('solutions')}
                  onMouseLeave={handleDropdownLeave}
                >
                  <div className="text-sm font-semibold text-black hover:text-green-600 flex items-center cursor-pointer transition-colors duration-200 font-satoshi">
                    Solutions <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${activeDropdown === 'solutions' ? 'rotate-180' : ''}`} />
                  </div>
                  <DropdownContent links={solutionsLinks} isVisible={activeDropdown === 'solutions'} colorScheme="purple" />
                </div>

                <div
                  className="relative"
                  onMouseEnter={() => handleDropdownEnter('resources')}
                  onMouseLeave={handleDropdownLeave}
                >
                  <div className="text-sm font-semibold text-black hover:text-green-600 flex items-center cursor-pointer transition-colors duration-200 font-satoshi">
                    Resources <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${activeDropdown === 'resources' ? 'rotate-180' : ''}`} />
                  </div>
                  <DropdownContent links={resourcesLinks} isVisible={activeDropdown === 'resources'} colorScheme="blue" />
                </div>

                <Link
                  to="/pricing"
                  className={`text-sm font-semibold transition-colors duration-200 font-satoshi ${isActive('/pricing') ? 'text-green-600' : 'text-black hover:text-green-600'}`}
                >
                  Pricing
                </Link>
              </div>
            </div>

            {/* Right: Auth */}
            <div className="hidden lg:flex lg:items-center lg:space-x-4">
              <Link
                to={getDashboardUrl('/signin')}
                className="text-sm font-semibold text-black hover:text-green-600 transition-colors duration-200 font-satoshi"
              >
                Log in
              </Link>
              <PrimaryButton text="Book a Demo" to="/demo" size="sm" />
            </div>

            {/* Mobile toggle */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-black focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white mt-2 rounded-2xl border border-gray-200 shadow-2xl mx-4 max-h-[80vh] overflow-y-auto">
          <div className="px-4 pt-4 pb-6 space-y-4 font-satoshi">
            <div>
              <p className="text-sm font-semibold text-green-600 mb-2">Product</p>
              <div className="grid grid-cols-2 gap-2">
                {productLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex flex-col items-start space-y-2 p-3 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                      {link.icon}
                    </div>
                    <div className="text-xs font-medium text-black text-left">{link.name}</div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-purple-600 mb-2">Solutions</p>
              <div className="grid grid-cols-2 gap-2">
                {solutionsLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex flex-col items-start space-y-2 p-3 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                      {link.icon}
                    </div>
                    <div className="text-xs font-medium text-black text-left">{link.name}</div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-blue-600 mb-2">Resources</p>
              <div className="grid grid-cols-2 gap-2">
                {resourcesLinks.map((link) =>
                  link.path.startsWith('http') ? (
                    <a
                      key={link.name}
                      href={link.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-start space-y-2 p-3 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                        {link.icon}
                      </div>
                      <div className="text-xs font-medium text-black text-left">{link.name}</div>
                    </a>
                  ) : (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex flex-col items-start space-y-2 p-3 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                        {link.icon}
                      </div>
                      <div className="text-xs font-medium text-black text-left">{link.name}</div>
                    </Link>
                  )
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200 space-y-3">
              <Link
                to="/pricing"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-center text-sm font-semibold text-black py-2"
              >
                Pricing
              </Link>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  to={getDashboardUrl('/signin')}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center border border-gray-300 text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Log in
                </Link>
                <div onClick={() => setIsMobileMenuOpen(false)}>
                  <PrimaryButton text="Book Demo" to="/demo" size="sm" className="w-full justify-center" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;