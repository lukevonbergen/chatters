import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import { Check, Zap, Users, BarChart2, Globe, Lock, MessageSquare } from "lucide-react";
import Navbar from "../../components/marketing/layout/Navbar";
import Footer from "../../components/marketing/layout/Footer";
import PageHeader from "../../components/marketing/common/sections/PageHeader";

const benefits = [
  { title: "Real-time Feedback", desc: "Guests scan, you get instant alerts. Fix issues before they become bad reviews.", icon: Zap },
  { title: "AI-Powered Insights", desc: "See themes, trends, and root causes automatically.", icon: BarChart2 },
  { title: "Easy Integration", desc: "No hardware. Works with your existing flow in minutes.", icon: Globe },
  { title: "Customisable Surveys", desc: "Match your brand and ask exactly what matters.", icon: MessageSquare },
  { title: "Team Collaboration", desc: "Escalations, assignments, and notifications that reach the right people.", icon: Users },
  { title: "Enterprise Security", desc: "Data handled correctly with best-practice security.", icon: Lock },
];

const DemoPage = () => {
  useEffect(() => {
    // Load Calendly script once
    if (!document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]')) {
      const script = document.createElement("script");
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Book a Demo | Chatters</title>
        <meta
          name="description"
          content="See how Chatters prevents bad reviews with real-time guest feedback and instant staff alerts. Book a quick demo."
        />
        <link rel="canonical" href="https://getchatters.com/demo" />
      </Helmet>

      <Navbar overlay />

      <PageHeader
        title="See Chatters in Action"
        description="A quick walkthrough of how guests leave feedback, how your team gets alerted, and how you protect your ratings."
        backgroundGradient="from-white via-white to-purple-50"
        showSubtitle
        subtitle="Book a Demo"
      />

      {/* Demo + explainer */}
      <section className="relative w-full">
        <div className="relative max-w-[1200px] mx-auto px-6 py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left: value props */}
            <div className="lg:col-span-5">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 font-satoshi">
                Stop bad reviews before they happen
              </h2>
              <p className="text-gray-700 mb-6">
                Guests scan a QR at the table. If something’s wrong, your team gets an instant alert — you fix it in minutes, not after a 1★ review.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Live in venues right now",
                  "30-second setup — no hardware",
                  "Works across all locations",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2 text-gray-800">
                    <span className="mt-0.5 inline-flex p-1 rounded-full bg-green-100 text-green-700">
                      <Check className="w-4 h-4" />
                    </span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((b) => (
                  <div key={b.title} className="rounded-xl border border-gray-200 bg-white/90 backdrop-blur-sm p-4">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                        <b.icon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="text-sm font-semibold text-gray-900">{b.title}</div>
                    </div>
                    <p className="text-sm text-gray-600">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Calendly embed */}
            <div className="lg:col-span-7">
              <div className="relative">
                <div className="rounded-2xl border border-gray-200 bg-white shadow-[0_0_24px_rgba(17,24,39,0.06)] p-3 sm:p-4">
                  {/* Calendly inline embed */}
                  <div
                    className="calendly-inline-widget rounded-xl overflow-hidden"
                    data-url="https://calendly.com/luke-getchatters/30min?hide_event_type_details=1&hide_gdpr_banner=1"
                    style={{ minWidth: "320px", height: "700px" }}
                  ></div>
                </div>
                <div
                  aria-hidden="true"
                  className="absolute -inset-6 rounded-3xl blur-2xl -z-10"
                  style={{
                    background:
                      "radial-gradient(closest-side, rgba(168,85,247,0.15), transparent 70%)",
                  }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Prefer email?{" "}
                <a href="mailto:luke@getchatters.com" className="underline">
                  Get in touch directly
                </a>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DemoPage;
