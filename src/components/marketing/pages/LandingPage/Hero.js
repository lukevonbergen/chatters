import React from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight} from "lucide-react";
import PrimaryButton from "../../common/buttons/PrimaryButton";

const Hero = ({
  eyebrow = "Chatters for Hospitality",
  title = "Turn on real-time feedback. Turn off bad reviews.",
  subtitle = "Capture issues at the table, resolve them in minutes, and watch your ratings climb. One dashboard. Instant alerts. Happier guests.",
  primaryCta = { label: "Book a demo", to: "/demo" },
  secondaryCta = { label: "Pricing", to: "/pricing" },
  bullets = [
    "Live alerts to the right staff",
    "No staff training required",
    "Works across all your locations",
  ],
  backgroundGradient = "from-white via-white to-purple-50",
}) => {

  return (
    <section className={`relative w-full bg-gradient-to-b ${backgroundGradient} overflow-hidden`}>
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.07,
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)
          `,
          backgroundSize: "28px 28px, 28px 28px",
          maskImage: "radial-gradient(ellipse at center, black 70%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 70%, transparent 100%)",
        }}
      />

      {/* Decorative blurred orbs */}
      <div
        aria-hidden="true"
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(168,85,247,0.25), transparent)" }}
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(59,130,246,0.22), transparent)" }}
      />

      {/* Content */}
      <div className="relative max-w-[1200px] mx-auto px-6 pt-36 lg:pt-40 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left: Copy */}
          <div className="lg:col-span-6 text-left">
            <p className="text-xs tracking-widest uppercase font-semibold text-purple-600/80 mb-3">
              {eyebrow}
            </p>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight font-satoshi mb-4">
              {title}
            </h1>
            <p className="text-lg lg:text-xl text-gray-700 leading-relaxed mb-8 max-w-xl">
              {subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6">
              <PrimaryButton
                text={primaryCta.label}
                to={primaryCta.to}
                size="sm"
              />

              <Link
                to={secondaryCta.to}
                className="group inline-flex items-center font-medium text-black hover:text-gray-900 transition-colors duration-200 font-satoshi"
                >
                <span>{secondaryCta.label}</span>
                <ArrowRight
                    className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1"
                />
                </Link>
            </div>

            {/* Bullet list */}
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex p-1 rounded-full bg-green-100 text-green-700">
                    <Check className="w-4 h-4" />
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            {/* Trust bar */}
            <div className="mt-8">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">
                Trusted by teams across hospitality & retail
              </p>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 opacity-80">
                <svg width="92" height="20" viewBox="0 0 92 20" className="text-gray-500">
                  <rect width="92" height="20" rx="4" fill="currentColor" opacity="0.2" />
                </svg>
                <svg width="80" height="20" viewBox="0 0 80 20" className="text-gray-500">
                  <rect width="80" height="20" rx="4" fill="currentColor" opacity="0.2" />
                </svg>
                <svg width="70" height="20" viewBox="0 0 70 20" className="text-gray-500">
                  <rect width="70" height="20" rx="4" fill="currentColor" opacity="0.2" />
                </svg>
                <svg width="64" height="20" viewBox="0 0 64 20" className="text-gray-500">
                  <rect width="64" height="20" rx="4" fill="currentColor" opacity="0.2" />
                </svg>
              </div>
            </div>
          </div>

          {/* Right: Mock product card */}
          <div className="lg:col-span-6">
            <div className="relative mx-auto w-full max-w-[560px]">
              <div className="relative rounded-2xl border border-gray-200 bg-white shadow-[0_0_24px_rgba(17,24,39,0.06)]">
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <div className="text-xs text-gray-500">Live Feedback</div>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-3 gap-4 mb-5">
                    {[
                      { label: "Today alerts", value: "12" },
                      { label: "Avg. response", value: "3m" },
                      { label: "Resolution rate", value: "84%" },
                    ].map((s) => (
                      <div key={s.label} className="rounded-xl border border-gray-200 p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                        <div className="text-[11px] uppercase tracking-wider text-gray-500 mt-1">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {[
                      { table: "Table 213", msg: "I'm still waiting for my food..", status: "Unresolved" },
                      { table: "Table 33", msg: "Just needs assistance", status: "Assistance Request" },
                      { table: "Table 801", msg: "Music is too loud!!", status: "Resolved" },
                    ].map((a, i) => (
                      <div key={i} className="flex items-center justify-between rounded-xl border border-gray-200 p-3">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{a.table}</div>
                          <div className="text-sm text-gray-600">{a.msg}</div>
                        </div>
                        <span
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg ${
                            a.status === "Resolved"
                              ? "bg-green-100 text-green-700"
                              : a.status === "Assistance Request"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {a.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div
                aria-hidden="true"
                className="absolute -inset-6 rounded-3xl blur-2xl"
                style={{ background: "radial-gradient(closest-side, rgba(168,85,247,0.15), transparent 70%)" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom divider curve */}
      <div className="absolute inset-x-0 bottom-0 h-10">
        <svg className="w-full h-full" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="url(#fade)" />
          <defs>
            <linearGradient id="fade" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
              <stop offset="100%" stopColor="rgba(255,255,255,1)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
