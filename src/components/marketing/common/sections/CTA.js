import React from 'react';
import PrimaryButton from '../buttons/PrimaryButton';

const CTA = ({ 
  title = "Ready to transform your customer feedback?", 
  subtitle = "Join hundreds of venues already using Chatters to improve their customer experience.",
  buttonText = "Book a Demo",
  buttonLink = "/demo",
  gradientDirection = "bg-gradient-to-br",
  backgroundGradient = "from-green-50 via-white to-blue-50"
}) => {
  return (
    <section className="py-12 lg:py-16 px-4 lg:px-6">
      <div className="max-w-[1400px] mx-auto">
        <div 
          className={`relative overflow-hidden rounded-2xl lg:rounded-3xl border border-gray-200 ${gradientDirection} ${backgroundGradient}`}
          style={{
            boxShadow: "0 0 20px rgba(0,0,0,0.08)" // subtle glow
          }}
        >

          {/* Dotted texture overlay */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: `
                radial-gradient(rgba(0,0,0,0.08) 1px, transparent 1px)
              `,
              backgroundSize: "12px 12px"
            }}
          />

          {/* Content */}
          <div className="relative flex flex-col lg:flex-row items-center justify-between px-8 lg:px-12 py-8 lg:py-10">
            {/* Text on the left */}
            <div className="text-left max-w-2xl">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 font-satoshi">
                {title}
              </h2>
              <p className="text-lg text-gray-600 font-satoshi">
                {subtitle}
              </p>
            </div>

            {/* Button on the right */}
            <div className="mt-6 lg:mt-0">
              <PrimaryButton 
                text={buttonText}
                to={buttonLink}
                size="lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;