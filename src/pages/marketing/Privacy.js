import React from "react";
import { Helmet } from "react-helmet";
import Navbar from "../../components/marketing/layout/Navbar";
import PageHeader from "../../components/marketing/common/sections/PageHeader";
import Footer from "../../components/marketing/layout/Footer";

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Privacy Policy | Chatters</title>
        <meta
          name="description"
          content="Read the Chatters Privacy Policy. Learn how we collect, use, and protect your personal data when using our guest feedback platform."
        />
        <meta
          name="keywords"
          content="Chatters privacy, Chatters privacy policy, Chatters GDPR, guest feedback privacy, hospitality software privacy, Chatters data protection"
        />
        <meta property="og:title" content="Chatters Privacy Policy" />
        <meta
          property="og:description"
          content="Review the Chatters Privacy Policy to understand how we handle your data responsibly, securely, and in compliance with GDPR."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://getchatters.com/privacy" />
      </Helmet>

      {/* Navbar overlay */}
      <Navbar overlay />

      <PageHeader
        title="Privacy Policy"
        description="Your privacy is important to us. This policy explains how Chatters collects, uses, and safeguards your personal information."
        backgroundGradient="from-white to-gray-100"
        showSubtitle={true}
        subtitle="Legal Information"
      />

      <section className="max-w-4xl mx-auto px-6 py-20 text-left">
        <div className="prose prose-lg prose-gray max-w-none">
          <p className="text-sm text-gray-600 mb-8">
            <strong>Last Updated:</strong> August 19, 2025
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Introduction</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            This Privacy Policy describes how Chatters Ltd ("we", "our", or "us") collects, uses, and protects
            your information when you use our website and services. We are committed to protecting your privacy
            and complying with applicable data protection laws, including the General Data Protection Regulation (GDPR)
            and the California Consumer Privacy Act (CCPA).
          </p>
          <p className="text-gray-700 mb-10 leading-relaxed">
            By using our services, you agree to the collection and use of information in accordance with this policy.
            If you do not agree with our practices, please do not use our services.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Information We Collect</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-4">2.1 Personal Information</h3>
          <p className="text-gray-700 mb-4 leading-relaxed">
            We collect personal information that you voluntarily provide to us when you:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
            <li>Create an account or register for our services</li>
            <li>Request a demo or contact us for information</li>
            <li>Subscribe to our newsletter or marketing communications</li>
            <li>Participate in surveys or provide feedback</li>
            <li>Contact our customer support team</li>
            <li>Make a payment for our services</li>
          </ul>
          <p className="text-gray-700 mb-6 leading-relaxed">
            This may include: name, email address, phone number, company name, job title, billing address,
            venue details, and payment information.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mb-4">2.2 Usage and Technical Data</h3>
          <p className="text-gray-700 mb-4 leading-relaxed">
            We automatically collect certain information when you use our services:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
            <li>Device information (type, operating system, browser type and version)</li>
            <li>IP address and location data</li>
            <li>Usage patterns and interaction data</li>
            <li>Log files and analytics data</li>
            <li>Cookies and similar tracking technologies</li>
            <li>Performance and diagnostic information</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-4">2.3 Customer Feedback Data</h3>
          <p className="text-gray-700 mb-10 leading-relaxed">
            As part of our feedback management service, we process feedback data submitted by your customers,
            including ratings, comments, and associated metadata. We act as a data processor for this information
            on behalf of our business customers.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">3. How We Use Your Information</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-4">3.1 Service Provision</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
            <li>Provide, maintain, and improve our feedback management platform</li>
            <li>Process payments and manage your account</li>
            <li>Deliver customer support and respond to inquiries</li>
            <li>Send service-related notifications and updates</li>
            <li>Customize your user experience</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-4">3.2 Communication</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
            <li>Send marketing communications (with your consent)</li>
            <li>Provide product updates and feature announcements</li>
            <li>Conduct surveys and gather feedback</li>
            <li>Send newsletters and educational content</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-4">3.3 Analytics and Improvement</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
            <li>Analyze usage patterns to improve our services</li>
            <li>Monitor and maintain security</li>
            <li>Conduct research and development</li>
            <li>Generate aggregated, anonymized insights</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-4">3.4 Legal Compliance</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-10 space-y-2">
            <li>Comply with legal obligations and regulations</li>
            <li>Protect our rights and prevent fraud</li>
            <li>Respond to legal requests and court orders</li>
            <li>Enforce our terms of service</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Legal Basis for Processing (GDPR)</h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            We process your personal data based on the following legal grounds:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-10 space-y-2">
            <li><strong>Contract Performance:</strong> To provide our services and fulfill our contractual obligations</li>
            <li><strong>Legitimate Interests:</strong> To improve our services, ensure security, and conduct business operations</li>
            <li><strong>Consent:</strong> For marketing communications and certain analytics (where required)</li>
            <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Data Sharing and Disclosure</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-4">5.1 Third-Party Service Providers</h3>
          <p className="text-gray-700 mb-4 leading-relaxed">
            We may share your information with trusted third-party service providers who assist us in:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
            <li>Cloud hosting and infrastructure (Vercel, Supabase)</li>
            <li>Payment processing (Stripe)</li>
            <li>Email delivery and marketing automation</li>
            <li>Analytics and performance monitoring</li>
            <li>Customer support tools</li>
            <li>Security and fraud prevention</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-4">5.2 Business Transfers</h3>
          <p className="text-gray-700 mb-6 leading-relaxed">
            In the event of a merger, acquisition, or sale of assets, your information may be transferred
            as part of the business transaction. We will provide notice before your data is transferred.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mb-4">5.3 Legal Requirements</h3>
          <p className="text-gray-700 mb-10 leading-relaxed">
            We may disclose your information if required by law, court order, or government request,
            or to protect our rights, property, or safety, or that of our users or the public.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Data Security</h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            We implement comprehensive security measures to protect your personal information:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
            <li>Encryption in transit and at rest using industry-standard protocols</li>
            <li>Regular security audits and vulnerability assessments</li>
            <li>Access controls and authentication mechanisms</li>
            <li>Employee training on data protection practices</li>
            <li>Secure development practices and code reviews</li>
            <li>Incident response and breach notification procedures</li>
          </ul>
          <p className="text-gray-700 mb-10 leading-relaxed">
            While we strive to protect your information, no method of transmission over the internet
            or electronic storage is 100% secure. We cannot guarantee absolute security.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Data Retention</h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            We retain your personal information for different periods depending on the type of data:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
            <li><strong>Account Data:</strong> For the duration of your account plus 3 years for legal compliance</li>
            <li><strong>Billing Data:</strong> 7 years for tax and accounting purposes</li>
            <li><strong>Marketing Data:</strong> Until you unsubscribe or withdraw consent</li>
            <li><strong>Technical Logs:</strong> 12 months for security and performance monitoring</li>
            <li><strong>Customer Feedback:</strong> As directed by our business customers (as data controllers)</li>
          </ul>
          <p className="text-gray-700 mb-10 leading-relaxed">
            When data is no longer needed, we securely delete or anonymize it in accordance with our
            data retention schedule and applicable legal requirements.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Your Rights and Choices</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-4">8.1 GDPR Rights (EU/UK Users)</h3>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Under GDPR, you have the following rights regarding your personal data:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
            <li><strong>Access:</strong> Request copies of your personal data</li>
            <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
            <li><strong>Erasure:</strong> Request deletion of your data (right to be forgotten)</li>
            <li><strong>Restriction:</strong> Request limitation of processing</li>
            <li><strong>Portability:</strong> Request transfer of your data to another service</li>
            <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
            <li><strong>Withdraw Consent:</strong> Withdraw consent for consent-based processing</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-4">8.2 CCPA Rights (California Users)</h3>
          <p className="text-gray-700 mb-4 leading-relaxed">
            California residents have additional rights under the CCPA:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
            <li>Know what personal information is collected and how it's used</li>
            <li>Request deletion of personal information</li>
            <li>Opt-out of the sale of personal information (we do not sell data)</li>
            <li>Non-discrimination for exercising privacy rights</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-4">8.3 How to Exercise Your Rights</h3>
          <p className="text-gray-700 mb-10 leading-relaxed">
            To exercise your rights, contact us at{" "}
            <a href="mailto:privacy@getchatters.com" className="text-purple-600 hover:underline">
              privacy@getchatters.com
            </a>{" "}
            or through your account settings. We will respond to verified requests within 30 days.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Cookies and Tracking Technologies</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-4">9.1 Types of Cookies We Use</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
            <li><strong>Essential Cookies:</strong> Required for basic site functionality</li>
            <li><strong>Performance Cookies:</strong> Help us analyze site usage and performance</li>
            <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
            <li><strong>Marketing Cookies:</strong> Track conversions and personalize ads (with consent)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-4">9.2 Managing Cookies</h3>
          <p className="text-gray-700 mb-10 leading-relaxed">
            You can manage cookie preferences through your browser settings or our cookie consent banner.
            Note that disabling certain cookies may affect site functionality.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">10. International Data Transfers</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Your information may be transferred to and processed in countries other than your country of residence.
            When we transfer data internationally, we ensure appropriate safeguards are in place, including:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-10 space-y-2">
            <li>Standard Contractual Clauses approved by the European Commission</li>
            <li>Adequacy decisions for countries with equivalent data protection</li>
            <li>Certification schemes and codes of conduct</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">11. Children's Privacy</h2>
          <p className="text-gray-700 mb-10 leading-relaxed">
            Our services are not intended for children under 16 years of age. We do not knowingly collect
            personal information from children under 16. If you become aware that a child has provided us
            with personal information, please contact us immediately.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">12. Changes to This Privacy Policy</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            We may update this Privacy Policy from time to time to reflect changes in our practices,
            technology, legal requirements, or other factors. When we make changes, we will:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
            <li>Update the "Last Updated" date at the top of this policy</li>
            <li>Notify you via email if the changes are material</li>
            <li>Post the updated policy on our website</li>
            <li>Provide additional notice as required by law</li>
          </ul>
          <p className="text-gray-700 mb-10 leading-relaxed">
            Your continued use of our services after the effective date constitutes acceptance of the updated policy.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">13. Contact Information</h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices,
            please contact us:
          </p>
          <div className="bg-gray-50 p-6 rounded-lg mb-10">
            <p className="text-gray-700 mb-2">
              <strong>Email:</strong>{" "}
              <a href="mailto:privacy@getchatters.com" className="text-purple-600 hover:underline">
                privacy@getchatters.com
              </a>
            </p>
            <p className="text-gray-700 mb-2">
              <strong>General Inquiries:</strong>{" "}
              <a href="mailto:hello@getchatters.com" className="text-purple-600 hover:underline">
                hello@getchatters.com
              </a>
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Data Protection Officer:</strong>{" "}
              <a href="mailto:dpo@getchatters.com" className="text-purple-600 hover:underline">
                dpo@getchatters.com
              </a>
            </p>
            <p className="text-gray-700">
              <strong>Address:</strong> Chatters Ltd, [Your Business Address]
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">14. Supervisory Authority</h2>
          <p className="text-gray-700 leading-relaxed">
            If you are located in the European Union and believe we have not adequately resolved a privacy concern,
            you have the right to lodge a complaint with your local data protection supervisory authority.
            A list of supervisory authorities is available at{" "}
            <a 
              href="https://edpb.europa.eu/about-edpb/board/members_en" 
              className="text-purple-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              the European Data Protection Board website
            </a>.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPage;
