import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/marketing/layout/Navbar';
import Footer from '../../components/marketing/layout/Footer';

const TermsAndConditionsPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-32 pb-16 sm:pt-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 space-y-3 tracking-tight">
              <span className="block">Terms &</span>
              <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Conditions
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
              Please read these terms carefully before using getchatters.com.
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600">
              Welcome to getchatters.com! These Terms & Conditions govern your use of our platform. By accessing or using getchatters.com, you agree to these terms. If you do not agree, please do not use the platform.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Eligibility</h2>
            <p className="text-gray-600">
              To use getchatters.com, you must be at least 18 years old or the legal age of majority in your jurisdiction. By using the platform, you represent and warrant that you meet these requirements.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Registration</h2>
            <p className="text-gray-600">
              To access certain features, you must create an account. You agree to provide accurate and complete information and to keep your password secure. You are responsible for all activities under your account.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Responsibilities</h2>
            <p className="text-gray-600">
              You agree to use getchatters.com only for lawful purposes. Prohibited activities include:
              <ul className="list-disc list-inside mt-2">
                <li>Violating any laws or regulations.</li>
                <li>Uploading malicious software or engaging in hacking.</li>
                <li>Harassing or harming other users.</li>
              </ul>
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Intellectual Property</h2>
            <p className="text-gray-600">
              All content on getchatters.com, including text, graphics, and logos, is owned by us or our licensors. You may not use, copy, or distribute any content without our prior written consent.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Payments and Billing</h2>
            <p className="text-gray-600">
              If you purchase a subscription, you agree to pay all applicable fees. Fees are non-refundable unless otherwise stated. We may change pricing at any time, with notice.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Termination</h2>
            <p className="text-gray-600">
              We reserve the right to terminate or suspend your account if you violate these terms. You may also terminate your account at any time by contacting us.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-600">
              getchatters.com is not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability is limited to the amount you paid us in the last 12 months.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Dispute Resolution</h2>
            <p className="text-gray-600">
              Any disputes will be resolved through binding arbitration in [Your Jurisdiction], in accordance with the rules of [Arbitration Organization].
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Governing Law</h2>
            <p className="text-gray-600">
              These terms are governed by the laws of [Your Jurisdiction]. Any disputes will be resolved in the courts of [Your Jurisdiction].
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to Terms</h2>
            <p className="text-gray-600">
              We may update these terms from time to time. Continued use of the platform constitutes acceptance of the updated terms.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Information</h2>
            <p className="text-gray-600">
              If you have any questions about these terms, please contact us at <a href="mailto:support@getchatters.com" className="text-green-600">support@getchatters.com</a>.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsAndConditionsPage;