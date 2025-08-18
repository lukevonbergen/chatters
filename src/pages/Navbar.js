import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, BarChart3, Palette, QrCode, Settings, Utensils, Building, ShoppingBag, Calendar, BookOpen, HelpCircle, FileText, GraduationCap } from 'lucide-react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownTimer, setDropdownTimer] = useState(null);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const productLinks = [
    { name: 'Real-time Analytics', path: '/features/real-time-stats', description: 'Monitor feedback as it happens', icon: <BarChart3 className="w-5 h-5" /> },
    { name: 'Custom Dashboards', path: '/features/dashboards', description: 'Personalized insights for your venue', icon: <Settings className="w-5 h-5" /> },
    { name: 'QR Code Generation', path: '/features/qr-codes', description: 'Easy feedback collection', icon: <QrCode className="w-5 h-5" /> },
    { name: 'Custom Branding', path: '/features/custom-branding', description: 'Match your brand identity', icon: <Palette className="w-5 h-5" /> },
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
      <div className="max-w-7xl mx-auto bg-[#082524] rounded-2xl shadow-2xl border border-white/10 py-12 px-6">
        <div className="grid grid-cols-2 gap-8">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="group flex items-start space-x-4 p-6 rounded-xl hover:bg-white/10 hover:shadow-sm transition-all duration-200"
              onClick={() => setActiveDropdown(null)}
            >
              <div className="flex-shrink-0 w-12 h-12 bg-[#4ECDC4]/20 rounded-xl flex items-center justify-center text-[#4ECDC4] group-hover:bg-[#4ECDC4] group-hover:text-[#082524] transition-all duration-200">
                {link.icon}
              </div>
              <div className="flex-1">
                <div className="font-satoshi font-semibold text-white group-hover:text-white transition-colors duration-200 text-lg">
                  {link.name}
                </div>
                <div className="mt-2 text-sm text-gray-300 font-satoshi leading-relaxed">
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
      <div className="max-w-7xl mx-auto bg-[#082524]/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10">
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
                <div className="text-sm font-semibold text-white hover:text-[#4ECDC4] flex items-center cursor-pointer transition-colors duration-200 font-satoshi">
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
                <div className="text-sm font-semibold text-white hover:text-[#4ECDC4] flex items-center cursor-pointer transition-colors duration-200 font-satoshi">
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
                <div className="text-sm font-semibold text-white hover:text-[#4ECDC4] flex items-center cursor-pointer transition-colors duration-200 font-satoshi">
                  Resources <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${activeDropdown === 'resources' ? 'rotate-180' : ''}`} />
                </div>
                <DropdownContent links={resourcesLinks} isVisible={activeDropdown === 'resources'} />
              </div>

              {/* Pricing Link */}
              <Link
                to="/pricing"
                className="text-sm font-semibold text-white hover:text-[#4ECDC4] transition-colors duration-200 font-satoshi"
              >
                Pricing
              </Link>
            </div>
          </div>

          {/* Right Side - Auth Buttons */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            <Link 
              to="https://my.getchatters.com/signin" 
              className="text-sm font-semibold text-white hover:text-[#4ECDC4] transition-colors duration-200 font-satoshi"
            >
              Log in
            </Link>
            <Link 
              to="/demo" 
              className="bg-[#4ECDC4] text-[#082524] px-6 py-2 rounded-lg text-sm font-semibold hover:bg-[#3db8b8] transition-all duration-200 font-satoshi shadow-md hover:shadow-lg"
            >
              Book a Demo
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#082524] mt-2 rounded-2xl border border-white/10 shadow-2xl mx-4">
          <div className="px-4 pt-4 pb-6 space-y-6 font-satoshi">
            {/* Product Section */}
            <div>
              <p className="text-sm font-semibold text-[#4ECDC4] mb-3">Product</p>
              <div className="space-y-3">
                {productLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/10"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-[#4ECDC4]/20 rounded-lg flex items-center justify-center text-[#4ECDC4]">
                      {link.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{link.name}</div>
                      <div className="text-xs text-gray-300 mt-1">{link.description}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Solutions Section */}
            <div>
              <p className="text-sm font-semibold text-[#4ECDC4] mb-3">Solutions</p>
              <div className="space-y-3">
                {solutionsLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/10"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-[#4ECDC4]/20 rounded-lg flex items-center justify-center text-[#4ECDC4]">
                      {link.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{link.name}</div>
                      <div className="text-xs text-gray-300 mt-1">{link.description}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Resources Section */}
            <div>
              <p className="text-sm font-semibold text-[#4ECDC4] mb-3">Resources</p>
              <div className="space-y-3">
                {resourcesLinks.map((link) => (
                  link.path.startsWith('http') ? (
                    <a
                      key={link.name}
                      href={link.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/10"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-[#4ECDC4]/20 rounded-lg flex items-center justify-center text-[#4ECDC4]">
                        {link.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{link.name}</div>
                        <div className="text-xs text-gray-300 mt-1">{link.description}</div>
                      </div>
                    </a>
                  ) : (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/10"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-[#4ECDC4]/20 rounded-lg flex items-center justify-center text-[#4ECDC4]">
                        {link.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{link.name}</div>
                        <div className="text-xs text-gray-300 mt-1">{link.description}</div>
                      </div>
                    </Link>
                  )
                ))}
              </div>
            </div>

            {/* Pricing */}
            <Link
              to="/pricing"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-sm font-semibold text-white"
            >
              Pricing
            </Link>

            {/* Auth Buttons */}
            <div className="pt-4 border-t border-white/20 space-y-3">
              <Link 
                to="https://my.getchatters.com/signin" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-sm font-semibold text-white"
              >
                Log in
              </Link>
              <Link 
                to="/demo" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block bg-[#4ECDC4] text-[#082524] px-4 py-2 rounded-lg text-sm font-semibold text-center hover:bg-[#3db8b8] transition-colors shadow-md"
              >
                Book a Demo
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
