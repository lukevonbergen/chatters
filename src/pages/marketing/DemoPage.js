import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import Navbar from "../../components/marketing/layout/Navbar";
import Footer from "../../components/marketing/layout/Footer";
import PageHeader from "../../components/marketing/common/sections/PageHeader";

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

      {/* Calendly Widget */}
      <section className="relative w-full">
        <div className="relative max-w-4xl mx-auto px-6 py-16 lg:py-20">
          <div className="flex justify-center">
            <div className="w-full max-w-3xl">
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
              <p className="text-sm text-gray-500 mt-3 text-center">
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
