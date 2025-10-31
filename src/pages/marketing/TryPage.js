// pages/marketing/TryPage.jsx
import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import { CheckCircle, CreditCard } from "lucide-react";
import Navbar from "../../components/marketing/layout/Navbar";
import Footer from "../../components/marketing/layout/Footer";
import PageHeader from "../../components/marketing/common/sections/PageHeader";

const TryPage = () => {
  // Load HubSpot form script & init
  useEffect(() => {
    const existing = document.querySelector('script[src="//js.hsforms.net/forms/embed/v2.js"]');

    const initForm = () => {
      if (window.hbspt?.forms) {
        window.hbspt.forms.create({
          region: "na1",
          portalId: "48822376",
          formId: "2383199b-725f-428f-9200-359049054325",
          target: "#hubspot-trial-form",
          css: "",
          cssClass: "hs-trial",
          disableInlineStyles: true,
        });
      }
    };

    if (existing) {
      // Script already present on page
      initForm();
      return;
    }

    const script = document.createElement("script");
    script.src = "//js.hsforms.net/forms/embed/v2.js";
    script.async = true;
    script.onload = initForm;
    document.body.appendChild(script);

    return () => {
      // optional cleanup
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Start Free Trial | Chatters - No Credit Card Required</title>
        <meta
          name="description"
          content="Start your free 14-day trial of Chatters. No credit card required. Prevent bad reviews with real-time guest feedback and instant staff alerts."
        />
        <meta
          name="keywords"
          content="free trial restaurant software, hospitality feedback trial, QR code feedback free trial, restaurant review management, guest feedback system trial"
        />
        <link rel="canonical" href="https://getchatters.com/try" />
        <meta property="og:title" content="Start Free Trial | Chatters - No Credit Card Required" />
        <meta
          property="og:description"
          content="Start your free 14-day trial of Chatters. No credit card required. Prevent bad reviews with real-time guest feedback."
        />
        <meta property="og:type" content="website" />
        <meta property="twitter:title" content="Start Free Trial | Chatters - No Credit Card Required" />
        <meta property="twitter:description" content="Start your free 14-day trial. No credit card required." />
      </Helmet>

      <Navbar overlay />

      <PageHeader
        title="Start Your Free Trial Today"
        description="Try Chatters free for 14 days. No credit card required. Set up in minutes and start preventing bad reviews immediately."
        backgroundGradient="from-white via-white to-green-50"
        showSubtitle={true}
        subtitle="Free Trial"
      />

      {/* Main Content */}
      <section className="relative w-full">
        <div className="relative max-w-6xl mx-auto px-6 py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: Benefits */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  What's included in your free trial
                </h2>
                <p className="text-lg text-gray-600">
                  Get full access to all Chatters features for 14 days. No credit card required, no strings attached.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  "Unlimited QR code feedback forms",
                  "Real-time kiosk mode for staff",
                  "Live floor plan & heatmaps",
                  "Advanced analytics & reports",
                  "NPS scoring & follow-ups",
                  "Staff leaderboards & recognition",
                  "Multi-location support",
                  "Google Reviews integration",
                  "Full customer support",
                  "No setup fees or contracts"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* No Credit Card Badge */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">No Credit Card Required</h3>
                    <p className="text-sm text-gray-600">
                      Start your trial immediately without entering payment details. We'll only ask for a card if you decide to continue after 14 days.
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Proof */}
              <div className="border-t border-gray-200 pt-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white"></div>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-900">200+ venues trust Chatters</span>
                </div>
                <p className="text-sm text-gray-600">
                  Join restaurants, pubs, and hotels across the UK preventing bad reviews and improving guest satisfaction.
                </p>
              </div>
            </div>

            {/* Right: Form */}
            <div>
              <div className="relative">
                <div className="rounded-2xl border border-gray-200 bg-white shadow-[0_0_24px_rgba(17,24,39,0.06)] p-6 sm:p-8">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Create your free account
                    </h3>
                    <p className="text-sm text-gray-600">
                      Fill in your details below to get started. We'll set up your account immediately.
                    </p>
                  </div>

                  {/* HubSpot Form Container */}
                  <div id="hubspot-trial-form" className="hubspot-form-container"></div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                      By signing up, you agree to our{" "}
                      <a href="/terms" className="underline hover:text-gray-700">Terms of Service</a>
                      {" "}and{" "}
                      <a href="/privacy" className="underline hover:text-gray-700">Privacy Policy</a>.
                    </p>
                  </div>
                </div>
                <div
                  aria-hidden="true"
                  className="absolute -inset-6 rounded-3xl blur-2xl -z-10"
                  style={{
                    background:
                      "radial-gradient(closest-side, rgba(34,197,94,0.15), transparent 70%)",
                  }}
                />
              </div>

              {/* Help Text */}
              <p className="text-sm text-gray-500 mt-4 text-center">
                Need help getting started?{" "}
                <a href="/contact" className="text-green-600 hover:text-green-700 font-medium">
                  Contact our team
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">14 Days</div>
              <div className="text-sm text-gray-600">Full-featured free trial</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">5 Minutes</div>
              <div className="text-sm text-gray-600">Average setup time</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">0%</div>
              <div className="text-sm text-gray-600">Credit card required</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TryPage;
