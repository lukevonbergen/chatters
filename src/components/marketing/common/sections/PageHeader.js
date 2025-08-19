// components/marketing/common/sections/PageHeader.jsx
import React from 'react';

const PageHeader = ({
  title = "Page Title",
  description = "Detailed description of what this page is about and what value it provides to users.",
  backgroundGradient = "from-green-50 via-white to-blue-50",
  showSubtitle = false,
  subtitle = ""
}) => {
  return (
    <section className={`relative w-full bg-gradient-to-b ${backgroundGradient}`}>
      {/* Dotted texture overlay (no external image) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: "radial-gradient(rgba(0,0,0,0.08) 1px, transparent 1px)",
          backgroundSize: "12px 12px"
        }}
      />

      {/* Content: top padding to clear fixed overlay navbar */}
      <div className="relative max-w-4xl mx-auto px-6 pt-36 lg:pt-40 pb-24 lg:pb-28 text-center">
        {showSubtitle && subtitle && (
          <p className="text-sm lg:text-base font-semibold text-gray-600 mb-4 font-satoshi tracking-wide uppercase">
            {subtitle}
          </p>
        )}

        <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6 font-satoshi leading-tight">
          {title}
        </h1>

        {description && (
          <p className="text-lg lg:text-xl text-gray-700 font-satoshi leading-relaxed max-w-3xl mx-auto">
            {description}
          </p>
        )}
      </div>
    </section>
  );
};

export default PageHeader;
