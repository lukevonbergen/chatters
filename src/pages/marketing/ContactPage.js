// pages/marketing/ContactPage.jsx
import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import { Mail, Phone } from "lucide-react";
import Navbar from "../../components/marketing/layout/Navbar";
import Footer from "../../components/marketing/layout/Footer";
import PageHeader from "../../components/marketing/common/sections/PageHeader";

const ContactPage = () => {
  // Load HubSpot form script & init
  useEffect(() => {
    const existing = document.querySelector('script[src="//js.hsforms.net/forms/embed/v2.js"]');

    const initForm = () => {
      if (window.hbspt?.forms) {
        window.hbspt.forms.create({
          portalId: "48822376",
          formId: "a4b40ec3-1cf5-422e-a540-e405db7d3d02",
          target: "#hubspot-form",
          css: "",                  // no inline CSS
          cssClass: "hs-contact",   // hook for your CSS if needed
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
      // optional cleanup: don't remove script if other pages use it
      // If you want to remove, uncomment below:
      // document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Contact Chatters | Restaurant Software Demo & Support UK</title>
        <meta
          name="description"
          content="Book a Chatters demo or get support for your restaurant feedback system. Speak to our UK hospitality experts about improving guest satisfaction and preventing bad reviews. Quick response guaranteed."
        />
        <meta
          name="keywords"
          content="restaurant software support UK, hospitality feedback software demo, pub technology consultation, Chatters contact, restaurant feedback system support, UK hospitality software demo"
        />
        <link rel="canonical" href="https://getchatters.com/contact" />
        <meta property="og:title" content="Contact Chatters | Restaurant Software Demo & Support UK" />
        <meta
          property="og:description"
          content="Book a Chatters demo or get support for your restaurant feedback system. Speak to our UK hospitality experts about improving guest satisfaction."
        />
        <meta property="og:type" content="website" />
        <meta property="twitter:title" content="Contact Chatters | Restaurant Software Demo & Support UK" />
        <meta property="twitter:description" content="Book a demo or get support for your restaurant feedback system. Speak to our UK hospitality experts." />
      </Helmet>

      {/* Overlay navbar for consistent hero overlap */}
      <Navbar overlay />

      {/* PageHeader hero */}
      <PageHeader
        title="Contact Chatters - UK Restaurant Software Experts"
        description="Book a demo, get support, or speak to our UK hospitality technology team. We help restaurants, pubs, and hotels improve guest satisfaction and prevent negative reviews."
        backgroundGradient="from-white via-white to-purple-50"
        showSubtitle={true}
        subtitle="Support & Sales"
      />

      {/* Content */}
      <section className="relative w-full">
        {/* subtle background treatment to match the rest of your site */}
        <div
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)
            `,
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative max-w-[1200px] mx-auto px-6 py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* HubSpot Form */}
            <div className="rounded-2xl border border-gray-200 bg-white/90 backdrop-blur-sm shadow-[0_0_24px_rgba(17,24,39,0.06)] p-6 lg:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 font-satoshi">
                Send us a message
              </h2>
              <p className="text-gray-600 mb-6">
                Tell us a little about your venue and what you’re looking to achieve.
              </p>
              <div id="hubspot-form" className="space-y-4" />
            </div>

            {/* Contact Info / Cards */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-200 bg-white/90 backdrop-blur-sm shadow-[0_0_24px_rgba(17,24,39,0.06)] p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 font-satoshi">
                  Contact Information
                </h3>

                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <a
                        href="mailto:luke@getchatters.com"
                        className="text-base font-medium text-gray-900 hover:underline"
                      >
                        luke@getchatters.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <a
                        href="tel:+447932065904"
                        className="text-base font-medium text-gray-900 hover:underline"
                      >
                        +44 7932 065 904
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Optional: Quick notes / hours / response time */}
              <div className="rounded-2xl border border-gray-200 bg-white/90 backdrop-blur-sm shadow-[0_0_24px_rgba(17,24,39,0.06)] p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 font-satoshi">
                  Response times
                </h3>
                <p className="text-gray-600">
                  We typically reply within one working day. For urgent issues, please include
                  your venue name and best contact number.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;