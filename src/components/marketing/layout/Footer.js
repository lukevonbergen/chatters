import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <div>
            <img src="/img/Logo.svg" alt="Chatters" className="h-8 w-auto mb-4 filter invert" />
            <p className="text-gray-400 leading-relaxed font-satoshi">
              The leading feedback management platform for hospitality businesses.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 font-satoshi">Product</h4>
            <ul className="space-y-2 text-gray-400 font-satoshi">
              <li><a href="/features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="/#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="/integrations" className="hover:text-white transition-colors">Integrations</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 font-satoshi">Company</h4>
            <ul className="space-y-2 text-gray-400 font-satoshi">
              <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
              <li><a href="/blog" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="/careers" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 font-satoshi">Support</h4>
            <ul className="space-y-2 text-gray-400 font-satoshi">
              <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="/docs" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 mt-12 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-400 font-satoshi">&copy; 2025 Chatters. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="text-gray-400 hover:text-white transition-colors font-satoshi">Twitter</a>
            <a href="https://www.linkedin.com/company/getchatters/" className="text-gray-400 hover:text-white transition-colors font-satoshi" target='blank'>LinkedIn</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors font-satoshi">Facebook</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;