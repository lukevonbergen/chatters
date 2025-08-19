import React from 'react';
import { Link } from 'react-router-dom';

const CTASection = ({ 
  title = "Ready to Transform Your Customer Experience?", 
  description = "Join hundreds of businesses using Chatters to protect their reputation and improve customer satisfaction.",
  primaryButtonText = "Book a Demo",
  primaryButtonLink = "/demo",
  secondaryButtonText = "Learn More",
  secondaryButtonLink = "/features",
  showSecondaryButton = true,
  className = ""
}) => {
  return (
    <section className={`py-20 bg-gradient-to-br from-gray-50 to-white ${className}`}>
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-black mb-6 font-satoshi">
          {title}
        </h2>
        <p className="text-xl text-gray-600 mb-8 font-satoshi leading-relaxed">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to={primaryButtonLink}
            className="bg-[#1A535C] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#144449] transition-all duration-200 font-satoshi inline-flex items-center justify-center"
          >
            {primaryButtonText}
          </Link>
          {showSecondaryButton && (
            <Link 
              to={secondaryButtonLink}
              className="border-2 border-gray-300 text-black px-8 py-4 rounded-lg text-lg font-semibold hover:border-[#1A535C] hover:text-[#1A535C] transition-all duration-200 font-satoshi inline-flex items-center justify-center"
            >
              {secondaryButtonText}
            </Link>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-6 font-satoshi">
          No credit card required • Free 14-day trial • Setup in minutes
        </p>
      </div>
    </section>
  );
};

export default CTASection;