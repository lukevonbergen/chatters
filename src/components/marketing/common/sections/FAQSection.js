import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQItem = ({ item, idx, openIndex, setOpenIndex }) => {
  const open = openIndex === idx;
  const id = `faq-${idx}`;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/85 backdrop-blur-sm px-5 sm:px-6 py-4">
      <button
        className="w-full flex items-center justify-between text-left"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => setOpenIndex(open ? null : idx)}
      >
        <span className="text-base sm:text-lg font-semibold text-gray-900">
          {item.q}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        id={`${id}-panel`}
        role="region"
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pt-3 text-gray-700 leading-relaxed">
            {typeof item.a === "string" ? <p>{item.a}</p> : item.a}
          </div>
        </div>
      </div>
    </div>
  );
};

const FAQSection = ({
  eyebrow = "FAQ",
  title = "Frequently asked questions",
  description = "Everything you need to know about Chatters.",
  faqs = [],
  defaultOpenIndex = null, // pass 0 to open the first one initially
  backgroundGradient = "from-white via-white to-purple-50",
  gradientDirection = "bg-gradient-to-b",
  dottedBackground = true,
  orbGlow = false,
  wavyBottom = false,
  withSchema = true,
}) => {
  const [openIndex, setOpenIndex] = useState(defaultOpenIndex);

  return (
    <section
      className={`relative w-full ${gradientDirection} ${backgroundGradient} overflow-hidden`}
    >
      {/* Background effects */}
      {dottedBackground && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.07,
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)
            `,
            backgroundSize: "28px 28px, 28px 28px",
          }}
        />
      )}
      {orbGlow && (
        <>
          <div
            aria-hidden="true"
            className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(closest-side, rgba(168,85,247,0.16), transparent)",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-28 -right-24 w-96 h-96 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(closest-side, rgba(59,130,246,0.12), transparent)",
            }}
          />
        </>
      )}

      {/* Content */}
      <div className="relative max-w-[900px] mx-auto px-6 py-16 lg:py-24">
        {eyebrow && (
          <p className="text-xs tracking-widest uppercase font-semibold text-purple-600/80 mb-3 text-center">
            {eyebrow}
          </p>
        )}
        {title && (
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 font-satoshi text-center mb-4">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-lg text-gray-700 leading-relaxed text-center mb-10 max-w-2xl mx-auto">
            {description}
          </p>
        )}

        <div className="space-y-4">
          {faqs.map((item, i) => (
            <FAQItem
              key={i}
              item={item}
              idx={i}
              openIndex={openIndex}
              setOpenIndex={setOpenIndex}
            />
          ))}
        </div>
      </div>

      {/* Optional wavy bottom */}
      {wavyBottom && (
        <div className="absolute inset-x-0 bottom-0 h-10">
          <svg
            className="w-full h-full"
            viewBox="0 0 1440 80"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"
              fill="url(#fadeFAQWave)"
            />
            <defs>
              <linearGradient id="fadeFAQWave" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
                <stop offset="100%" stopColor="rgba(255,255,255,1)" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}

      {/* JSON-LD schema for SEO */}
      {withSchema && faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: typeof f.a === "string" ? f.a : "",
                },
              })),
            }),
          }}
        />
      )}
    </section>
  );
};

export default FAQSection;