// components/marketing/common/sections/TestimonialsSection.jsx
import React from "react";

const Stars = ({ rating = 5 }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const isFull = i < full;
        const isHalf = !isFull && half && i === full;
        return (
          <svg
            key={i}
            viewBox="0 0 20 20"
            className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0"
            aria-hidden="true"
          >
            {isHalf ? (
              <>
                <defs>
                  <linearGradient id={`half-${i}`} x1="0" x2="1" y1="0" y2="0">
                    <stop offset="50%" stopColor="currentColor" />
                    <stop offset="50%" stopColor="transparent" />
                  </linearGradient>
                </defs>
                <path
                  fill={`url(#half-${i})`}
                  d="M10 1.5l2.7 5.46 6.03.88-4.36 4.25 1.03 6.01L10 15.9l-5.4 2.84 1.03-6.01L1.27 7.84l6.03-.88L10 1.5z"
                />
              </>
            ) : (
              <path
                className={isFull ? "fill-current" : "fill-transparent stroke-current"}
                strokeWidth={isFull ? "0" : "1"}
                d="M10 1.5l2.7 5.46 6.03.88-4.36 4.25 1.03 6.01L10 15.9l-5.4 2.84 1.03-6.01L1.27 7.84l6.03-.88L10 1.5z"
              />
            )}
          </svg>
        );
      })}
    </div>
  );
};

const TestimonialsSection = ({
  eyebrow = "What customers say",
  title = "Loved by hospitality and retail teams",
  description = "Real teams using Chatters to catch issues early, delight guests, and protect their reputation.",
  items = [],
}) => {
  return (
    <section className="pb-20 relative w-full overflow-hidden bg-gradient-to-b from-white via-white to-purple-50">
      <div className="max-w-[1200px] mx-auto px-4 py-16 text-center">
        {eyebrow && (
          <p className="text-xs tracking-widest uppercase font-semibold text-purple-600/80 mb-2">
            {eyebrow}
          </p>
        )}
        {title && (
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 font-satoshi mb-2">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-base text-gray-700 leading-relaxed mb-12 max-w-2xl mx-auto">
            {description}
          </p>
        )}
      </div>

      {/* Rows wrapper */}
      <div className="space-y-8">
        {/* Row 1 → */}
        <div className="relative w-full overflow-hidden">
          <div className="flex animate-marquee space-x-4">
            {[...items, ...items].map((t, i) => (
              <figure
                key={`row1-${i}`}
                className="w-[320px] flex-shrink-0 rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm"
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  {t.avatar ? (
                    <img
                      src={t.avatar}
                      alt={t.author || "Customer"}
                      className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-100 border border-gray-200" />
                  )}
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{t.author}</div>
                    {t.role && <div className="text-xs text-gray-600">{t.role}</div>}
                  </div>
                </div>
                {typeof t.rating === "number" && <Stars rating={t.rating} />}
                <blockquote className="text-gray-800 text-sm leading-relaxed mt-2">
                  “{t.quote}”
                </blockquote>
              </figure>
            ))}
          </div>
        </div>

        {/* Row 2 ← */}
        <div className="relative w-full overflow-hidden">
          <div className="flex animate-marquee-reverse space-x-4">
            {[...items, ...items].map((t, i) => (
              <figure
                key={`row2-${i}`}
                className="w-[320px] flex-shrink-0 rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm"
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  {t.avatar ? (
                    <img
                      src={t.avatar}
                      alt={t.author || "Customer"}
                      className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-100 border border-gray-200" />
                  )}
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{t.author}</div>
                    {t.role && <div className="text-xs text-gray-600">{t.role}</div>}
                  </div>
                </div>
                {typeof t.rating === "number" && <Stars rating={t.rating} />}
                <blockquote className="text-gray-800 text-sm leading-relaxed mt-2">
                  “{t.quote}”
                </blockquote>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
