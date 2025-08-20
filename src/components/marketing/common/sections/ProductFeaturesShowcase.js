// components/marketing/common/sections/ProductFeaturesStatic.jsx
import React from "react";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import PrimaryButton from "../../common/buttons/PrimaryButton";

const ProductFeaturesStatic = ({
  eyebrow = "Product Features",
  title = "Everything you need to prevent bad reviews",
  description = "Designed for hospitality teams. See issues early, act faster, and leave guests happier.",
  primaryCta = { label: "Book a demo", to: "/demo" },
  secondaryCta = { label: "See pricing", to: "/pricing" },
  features = [],
  withDivider = true,
  cardHeight = "auto",
  showChrome = true,
  glow = true,
  className = "",
}) => {
  const list = features.length
    ? features
    : [
        {
          id: "alerts",
          eyebrow: "Real-time",
          title: "Instant table alerts",
          description:
            "Detect unhappy guests in seconds and route to the right staff automatically.",
          bullets: ["Smart routing", "Manager overview", "No staff training"],
          image: { src: "/img/feature-alerts.png", alt: "Instant alerts" },
        },
        {
          id: "heatmap",
          eyebrow: "Live view",
          title: "Interactive table heatmap",
          description:
            "See sentiment by table with pulsing indicators for unresolved issues.",
          bullets: ["Mergeable tables", "Sentiment colours", "Tap to resolve"],
          image: { src: "/img/feature-heatmap.png", alt: "Heatmap" },
        },
        {
          id: "reviews",
          eyebrow: "Growth",
          title: "Boost 5-star reviews",
          description:
            "Redirect happy guests to Google/Tripadvisor and recover problems fast.",
          bullets: ["Review routing", "Branded UI", "Multi-location"],
          image: { src: "/img/feature-reviews.png", alt: "Reviews" },
        },
      ];

  const HeaderBlock = () => (
    <div className="mb-12 max-w-3xl mx-auto text-center">
      {eyebrow && (
        <p className="text-xs tracking-widest uppercase font-semibold text-purple-600/80 mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight font-satoshi mb-4">
        {title}
      </h2>
      {description && (
        <p className="text-lg text-gray-700 leading-relaxed mb-8">
          {description}
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
        {primaryCta?.to && (
          <PrimaryButton text={primaryCta.label} to={primaryCta.to} size="md" />
        )}
        {secondaryCta?.to && (
          <Link
            to={secondaryCta.to}
            className="group inline-flex items-center font-medium text-black underline underline-offset-4 hover:text-gray-900 transition-colors duration-200 font-satoshi"
          >
            <span>{secondaryCta.label}</span>
            <svg
              className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <section className={`relative w-full bg-white ${className}`}>
      {withDivider && (
        <div className="absolute inset-x-0 -top-px">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        </div>
      )}

      <div className="max-w-[1200px] mx-auto px-6 py-16 lg:py-24">
        <HeaderBlock />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {list.map((f, idx) => (
            <div
              key={f.id || idx}
              className="relative rounded-2xl border border-gray-200 bg-white shadow-[0_0_24px_rgba(17,24,39,0.06)] overflow-hidden flex flex-col"
              style={{ height: cardHeight }}
            >
              {glow && (
                <div
                  className="pointer-events-none absolute -inset-8 rounded-[28px] blur-2xl opacity-70"
                  style={{
                    background:
                      "radial-gradient(closest-side, rgba(168,85,247,0.10), transparent 70%)",
                  }}
                />
              )}

              {showChrome && (
                <div className="hidden md:flex items-center gap-1.5 px-4 py-2 border-b border-gray-200 relative z-[2]">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
              )}

              <div className="relative z-[2] p-6 flex flex-col flex-1">
                {f.eyebrow && (
                  <p className="text-[11px] tracking-widest uppercase font-semibold text-purple-600/80 mb-2">
                    {f.eyebrow}
                  </p>
                )}
                <h3 className="text-xl font-bold text-gray-900 font-satoshi mb-2">
                  {f.title}
                </h3>
                {f.description && (
                  <p className="text-sm text-gray-700 leading-relaxed mb-4">
                    {f.description}
                  </p>
                )}
                {Array.isArray(f.bullets) && f.bullets.length > 0 && (
                  <ul className="grid grid-cols-1 gap-2 text-sm text-gray-700 mb-4">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2">
                        <span className="mt-0.5 inline-flex p-1 rounded-full bg-green-100 text-green-700">
                          <Check className="w-4 h-4" />
                        </span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {f.image?.src && (
                  <div className="mt-auto">
                    <img
                      src={f.image.src}
                      alt={f.image.alt || ""}
                      className="block w-full h-auto rounded-lg border border-gray-100"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductFeaturesStatic;