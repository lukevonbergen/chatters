import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, BarChart3, Settings, Utensils, Building, ShoppingBag, Calendar, BookOpen, HelpCircle, FileText, GraduationCap, Zap, Globe, Monitor, Bell } from 'lucide-react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownTimer, setDropdownTimer] = useState(null);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const productLinks = [
    { name: 'Question Management', path: '/features/question-management', description: 'Custom feedback forms and intelligent question flows', icon: <HelpCircle className="w-5 h-5" /> },
    { name: 'Business Intelligence', path: '/features/business-intelligence', description: 'Advanced analytics and performance insights', icon: <BarChart3 className="w-5 h-5" /> },
    { name: 'Automation & Workflows', path: '/features/automation-workflows', description: 'Smart automated responses and escalation paths', icon: <Zap className="w-5 h-5" /> },
    { name: 'Multi-Location Control', path: '/features/multi-location-control', description: 'Centralized management for restaurant/hotel chains', icon: <Globe className="w-5 h-5" /> },
    { name: 'Kiosk Mode', path: '/features/kiosk-mode', description: 'Tablet-based feedback stations and self-service', icon: <Monitor className="w-5 h-5" /> },
    { name: 'Real-Time Alerts', path: '/features/real-time-alerts', description: 'Instant notifications and emergency escalation', icon: <Bell className="w-5 h-5" /> },
  ];

  const solutionsLinks = [
    { name: 'Restaurants', path: '/solutions/restaurants', description: 'Optimize dining experiences', icon: <Utensils className="w-5 h-5" /> },
    { name: 'Hotels', path: '/solutions/hotels', description: 'Enhance guest satisfaction', icon: <Building className="w-5 h-5" /> },
    { name: 'Retail', path: '/solutions/retail', description: 'Improve customer service', icon: <ShoppingBag className="w-5 h-5" /> },
    { name: 'Events', path: '/solutions/events', description: 'Perfect event feedback', icon: <Calendar className="w-5 h-5" /> },
  ];

  const resourcesLinks = [
    { name: 'Documentation', path: 'https://chatters.canny.io/changelog', description: 'Learn how to use Chatters', icon: <BookOpen className="w-5 h-5" /> },
    { name: 'Help Center', path: '/help', description: 'Get support when you need it', icon: <HelpCircle className="w-5 h-5" /> },
    { name: 'Blog', path: '/blog', description: 'Industry insights and tips', icon: <FileText className="w-5 h-5" /> },
    { name: 'Case Studies', path: '/case-studies', description: 'See how others succeed', icon: <GraduationCap className="w-5 h-5" /> },
  ];

  const handleDropdownEnter = (dropdown) => {
    // Clear any existing timer
    if (dropdownTimer) {
      clearTimeout(dropdownTimer);
      setDropdownTimer(null);
    }
    setActiveDropdown(dropdown);
  };

  const handleDropdownLeave = () => {
    // Set a delay before closing
    const timer = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
    setDropdownTimer(timer);
  };

  const handleDropdownContentEnter = () => {
    // Clear the timer when entering the dropdown content
    if (dropdownTimer) {
      clearTimeout(dropdownTimer);
      setDropdownTimer(null);
    }
  };

  const handleDropdownContentLeave = () => {
    // Set delay when leaving dropdown content
    const timer = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
    setDropdownTimer(timer);
  };

  const DropdownContent = ({ links, isVisible }) => (
    <div 
      className={`fixed left-4 right-4 top-20 z-40 transition-all duration-400 ease-out transform ${
        isVisible 
          ? 'opacity-100 visible translate-y-0 scale-100' 
          : 'opacity-0 invisible -translate-y-4 scale-95'
      }`}
      onMouseEnter={handleDropdownContentEnter}
      onMouseLeave={handleDropdownContentLeave}
    >
      <div className="max-w-[1400px] mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 py-12 px-6">
        <div className="grid grid-cols-2 gap-8">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="group flex items-start space-x-4 p-6 rounded-xl hover:bg-gray-50 hover:shadow-sm transition-all duration-200"
              onClick={() => setActiveDropdown(null)}
            >
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all duration-200">
                {link.icon}
              </div>
              <div className="flex-1">
                <div className="font-satoshi font-semibold text-black group-hover:text-black transition-colors duration-200 text-lg">
                  {link.name}
                </div>
                <div className="mt-2 text-sm text-gray-600 font-satoshi leading-relaxed">
                  {link.description}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <nav className="sticky top-0 z-50 font-satoshi p-4">
      <div className="max-w-[1400px] mx-auto bg-gray-100 rounded-2xl shadow-lg border border-gray-200">
        <div className="flex justify-between items-center h-16 px-6">
          {/* Left Side - Logo + Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img src="/img/Logo.svg" alt="Chatters Logo" className="h-8" />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex lg:items-center lg:space-x-8 relative">
              {/* Product Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => handleDropdownEnter('product')}
                onMouseLeave={handleDropdownLeave}
              >
                <div className="text-sm font-semibold text-black hover:text-green-600 flex items-center cursor-pointer transition-colors duration-200 font-satoshi">
                  Product <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${activeDropdown === 'product' ? 'rotate-180' : ''}`} />
                </div>
                <DropdownContent links={productLinks} isVisible={activeDropdown === 'product'} />
              </div>

              {/* Solutions Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => handleDropdownEnter('solutions')}
                onMouseLeave={handleDropdownLeave}
              >
                <div className="text-sm font-semibold text-black hover:text-green-600 flex items-center cursor-pointer transition-colors duration-200 font-satoshi">
                  Solutions <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${activeDropdown === 'solutions' ? 'rotate-180' : ''}`} />
                </div>
                <DropdownContent links={solutionsLinks} isVisible={activeDropdown === 'solutions'} />
              </div>

              {/* Resources Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => handleDropdownEnter('resources')}
                onMouseLeave={handleDropdownLeave}
              >
                <div className="text-sm font-semibold text-black hover:text-green-600 flex items-center cursor-pointer transition-colors duration-200 font-satoshi">
                  Resources <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${activeDropdown === 'resources' ? 'rotate-180' : ''}`} />
                </div>
                <DropdownContent links={resourcesLinks} isVisible={activeDropdown === 'resources'} />
              </div>

              {/* Pricing Link */}
              <Link
                to="/pricing"
                className="text-sm font-semibold text-black hover:text-green-600 transition-colors duration-200 font-satoshi"
              >
                Pricing
              </Link>
            </div>
          </div>

          {/* Right Side - Auth Buttons */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            <Link 
              to="https://my.getchatters.com/signin" 
              className="text-sm font-semibold text-black hover:text-green-600 transition-colors duration-200 font-satoshi"
            >
              Log in
            </Link>
            <Link 
              to="/demo" 
              className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-all duration-200 font-satoshi shadow-md hover:shadow-lg"
            >
              Book a Demo
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
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

      {/* Mobile Nav Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white mt-2 rounded-2xl border border-gray-200 shadow-2xl mx-4 max-h-[80vh] overflow-y-auto">
          <div className="px-4 pt-4 pb-6 space-y-4 font-satoshi">
            {/* Product Section */}
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

            {/* Solutions Section */}
            <div>
              <p className="text-sm font-semibold text-green-600 mb-2">Solutions</p>
              <div className="grid grid-cols-2 gap-2">
                {solutionsLinks.map((link) => (
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

            {/* Resources Section */}
            <div>
              <p className="text-sm font-semibold text-green-600 mb-2">Resources</p>
              <div className="grid grid-cols-2 gap-2">
                {resourcesLinks.map((link) => (
                  link.path.startsWith('http') ? (
                    <a
                      key={link.name}
                      href={link.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-start space-y-2 p-3 rounded-lg hover:bg-white/10"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-[#4ECDC4]/20 rounded-lg flex items-center justify-center text-[#4ECDC4]">
                        {link.icon}
                      </div>
                      <div className="text-xs font-medium text-black text-left">{link.name}</div>
                    </a>
                  ) : (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex flex-col items-start space-y-2 p-3 rounded-lg hover:bg-white/10"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-[#4ECDC4]/20 rounded-lg flex items-center justify-center text-[#4ECDC4]">
                        {link.icon}
                      </div>
                      <div className="text-xs font-medium text-black text-left">{link.name}</div>
                    </Link>
                  )
                ))}
              </div>
            </div>

            {/* Pricing & Auth Section */}
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
                  to="https://my.getchatters.com/signin" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center border border-gray-300 text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Log in
                </Link>
                <Link 
                  to="/demo" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold text-center hover:bg-green-700 transition-colors shadow-md"
                >
                  Book Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
