import React from "react";

const FeatureGrid = ({
  eyebrow = "Key Benefits",
  eyebrowColour = "text-purple-600/80",
  title = "Why teams choose Chatters",
  description = "",
  items = [],
  cols = { base: 1, sm: 2, md: 3, lg: 3 },

  // toggles
  dottedBackground = true,
  orbGlow = true,
  wavyBottom = false,

  // theme props
  gradientDirection = "bg-gradient-to-b",
  backgroundGradient = "from-white via-white to-purple-50",

  /** If you want a precise CSS gradient, set this:
   *  e.g. "linear-gradient(to bottom, #fff 0%, #e0f2fe 100%)"
   *  When provided, Tailwind gradient classes are NOT applied.
   */
  customGradient = "",
}) => {
  const gridCols = [
    `grid-cols-${cols.base ?? 1}`,
    cols.sm ? `sm:grid-cols-${cols.sm}` : "",
    cols.md ? `md:grid-cols-${cols.md}` : "",
    cols.lg ? `lg:grid-cols-${cols.lg}` : "",
  ].filter(Boolean).join(" ");

  const useInline = Boolean(customGradient);

  return (
    <section
      className={[
        "relative w-full overflow-hidden",
        useInline ? "" : `${gradientDirection} ${backgroundGradient}`
      ].join(" ")}
      style={useInline ? { backgroundImage: customGradient } : undefined}
    >
      {/* Content */}
      <div className="relative max-w-[1200px] mx-auto px-6 py-20 lg:py-28 text-center">
        {eyebrow && (
          <p className={`text-xs tracking-widest uppercase font-semibold ${eyebrowColour} mb-3`}>
            {eyebrow}
          </p>
        )}

        {title && (
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 font-satoshi mb-4">
            {title}
          </h2>
        )}

        {description && (
          <p className="text-lg text-gray-700 leading-relaxed mb-12 max-w-2xl mx-auto">
            {description}
          </p>
        )}

        <div className={`grid ${gridCols} gap-8`}>
          {items.map((item, i) => (
            <div
              key={i}
              className="relative rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm p-8 text-left shadow-[0_0_24px_rgba(17,24,39,0.06)] hover:shadow-[0_0_28px_rgba(17,24,39,0.12)] transition-shadow duration-200"
            >
              {item.icon && (
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-50 mb-6">
                  {item.icon}
                </div>
              )}
              {item.title && (
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {item.title}
                </h3>
              )}
              {item.description && (
                <p className="text-gray-700 leading-relaxed text-base">
                  {item.description}
                </p>
              )}
              {item.cta}
            </div>
          ))}
        </div>
      </div>

      {/* Wavy bottom (optional) */}
      {wavyBottom && (
        <div className="absolute inset-x-0 bottom-0 h-14">
          <svg className="w-full h-full" viewBox="0 0 1440 110" preserveAspectRatio="none" aria-hidden="true">
            <path
              d="M0,70 C180,110 320,20 520,50 S920,120 1120,60 S1320,10 1440,50 L1440,110 L0,110 Z"
              fill="url(#fadeFeatureGridStronger)"
            />
            <defs>
              <linearGradient id="fadeFeatureGridStronger" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
                <stop offset="100%" stopColor="rgba(255,255,255,1)" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}
    </section>
  );
};

export default FeatureGrid;