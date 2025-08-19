import React from "react";
import { Helmet } from "react-helmet";
import Navbar from "../../components/marketing/layout/Navbar";
import PageHeader from "../../components/marketing/common/sections/PageHeader";
import Footer from "../../components/marketing/layout/Footer";

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Terms & Conditions | Chatters</title>
        <meta
          name="description"
          content="Read the Terms & Conditions for using Chatters real-time feedback software. Learn about eligibility, accounts, usage, intellectual property, and more."
        />
        <meta
          name="keywords"
          content="Chatters terms, Chatters conditions, Chatters legal, guest feedback software terms, hospitality software terms, Chatters agreement"
        />
        <meta property="og:title" content="Chatters Terms & Conditions" />
        <meta
          property="og:description"
          content="Review the Terms & Conditions for using Chatters. Understand your rights, responsibilities, and legal obligations as a user of our feedback platform."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://getchatters.com/terms" />
      </Helmet>

      {/* Navbar overlay */}
      <Navbar overlay />

      <PageHeader
        title="Terms & Conditions"
        description="Please read these terms and conditions carefully before using Chatters."
        backgroundGradient="from-white to-gray-100"
        showSubtitle={true}
        subtitle="Legal Information"
      />

      <section className="max-w-4xl mx-auto px-6 py-20 text-left">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Introduction</h2>
        <p className="text-gray-700 mb-10 leading-relaxed">
          These Terms & Conditions govern your use of Chatters. By accessing or using our service,
          you agree to be bound by these Terms. If you do not agree, you must not use the service.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Eligibility</h2>
        <p className="text-gray-700 mb-10 leading-relaxed">
          You must be at least 18 years old to use Chatters. By using the service, you represent and
          warrant that you meet this requirement.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Use of Service</h2>
        <p className="text-gray-700 mb-10 leading-relaxed">
          You agree to use Chatters only for lawful purposes and in accordance with these Terms.
          You are responsible for ensuring that your use of the service does not violate any
          applicable laws or regulations.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Accounts</h2>
        <p className="text-gray-700 mb-10 leading-relaxed">
          When you create an account, you must provide accurate and complete information. You are
          responsible for maintaining the confidentiality of your account credentials and for all
          activities under your account.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Intellectual Property</h2>
        <p className="text-gray-700 mb-10 leading-relaxed">
          All content, features, and functionality of Chatters are and will remain the exclusive
          property of Chatters Ltd. You may not copy, modify, distribute, or create derivative works
          without prior written consent.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Termination</h2>
        <p className="text-gray-700 mb-10 leading-relaxed">
          We may terminate or suspend your account and access to the service immediately, without
          prior notice, if you breach these Terms.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Limitation of Liability</h2>
        <p className="text-gray-700 mb-10 leading-relaxed">
          To the fullest extent permitted by law, Chatters shall not be liable for any indirect,
          incidental, special, consequential, or punitive damages arising from your use of the
          service.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Governing Law</h2>
        <p className="text-gray-700 mb-10 leading-relaxed">
          These Terms are governed by and construed in accordance with the laws of England and
          Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of
          England and Wales.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Changes</h2>
        <p className="text-gray-700 mb-10 leading-relaxed">
          We reserve the right to update or modify these Terms at any time. Changes will be posted
          on this page with an updated revision date.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Contact Us</h2>
        <p className="text-gray-700 leading-relaxed">
          If you have any questions about these Terms, please contact us at:{" "}
          <a
            href="mailto:hello@getchatters.com"
            className="text-purple-600 hover:underline"
          >
            hello@getchatters.com
          </a>
        </p>
      </section>

      <Footer />
    </div>
  );
};

export default TermsPage;
