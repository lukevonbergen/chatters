// components/marketing/common/sections/ContentSplit.jsx
import React from "react";
import { Check } from "lucide-react";
import PrimaryButton from "../../common/buttons/PrimaryButton";
import { Link } from "react-router-dom";

const ContentSplit = ({
  eyebrow = "Why Chatters",
  eyebrowColour = "text-purple-600/80",
  title = "Resolve issues before they become bad reviews.",
  description = "Give managers real-time visibility into guest sentiment, route alerts to the right staff, and fix problems while the guest is still at the table.",
  bullets = [
    "Instant alerts with smart routing",
    "No staff training required",
    "Works across all locations",
  ],
  primaryCta = { label: "Book a demo", to: "/demo" },
  secondaryCta = { label: "See pricing", to: "/pricing" },
  image = {
    src: "/img/mock-dashboard.png", // replace with your asset
    alt: "Chatters dashboard",
  },
  reversed = false, // set true to put image on the left, text on the right
  withDivider = true, // top divider to separate from PageHeader
}) => {
  return (
    <section className="relative w-full bg-white">
      {withDivider && (
        <div className="absolute inset-x-0 -top-px">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        </div>
      )}

      <div className="max-w-[1200px] mx-auto px-6 py-16 lg:py-24">
        <div
          className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center ${
            reversed ? "lg:[&>div:first-child]:order-2 lg:[&>div:last-child]:order-1" : ""
          }`}
        >
          {/* Text */}
          <div className="lg:col-span-6">
            {eyebrow && (
              <p className={`text-xs tracking-widest uppercase font-semibold ${eyebrowColour} mb-3`}>
                {eyebrow}
              </p>
            )}

            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight font-satoshi mb-4">
              {title}
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              {description}
            </p>

            {bullets?.length > 0 && (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700 mb-8">
                {bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex p-1 rounded-full bg-green-100 text-green-700">
                      <Check className="w-4 h-4" />
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
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

          {/* Image */}
          <div className="lg:col-span-6">
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl blur-2xl opacity-70 pointer-events-none"
                   style={{ background: "radial-gradient(closest-side, rgba(168,85,247,0.10), transparent 70%)" }} />
              <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-[0_0_24px_rgba(17,24,39,0.06)]">
                {/* If you want a browser-chrome top bar */}
                <div className="hidden md:flex items-center gap-1.5 px-4 py-2 border-b border-gray-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <img
                  src={image.src}
                  alt={image.alt || ""}
                  className="block w-full h-auto"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContentSplit;