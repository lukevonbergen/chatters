import React, { useEffect } from 'react'; // Add useEffect
import { Link } from 'react-router-dom';
import Navbar from '../../components/marketing/layout/Navbar';
import Footer from '../../components/marketing/layout/Footer';
import { loadStripe } from '@stripe/stripe-js'; // Import loadStripe

const PrivacyPolicyPage = () => {

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-32 pb-16 sm:pt-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 space-y-3 tracking-tight">
              <span className="block">Privacy</span>
              <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Policy
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
              Your privacy is important to us. Learn how we collect, use, and protect your data.
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
              This Privacy Policy explains how getchatters.com collects, uses, and protects your personal data. By using our platform, you agree to the practices described in this policy.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Data We Collect</h2>
            <p className="text-gray-600">
              We collect the following types of data:
              <ul className="list-disc list-inside mt-2">
                <li><strong>Personal Data:</strong> Name, email address, and contact information.</li>
                <li><strong>Usage Data:</strong> Information about how you use the platform, such as IP address and browser type.</li>
                <li><strong>Cookies:</strong> Small files stored on your device to enhance your experience.</li>
              </ul>
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Data</h2>
            <p className="text-gray-600">
              We use your data to:
              <ul className="list-disc list-inside mt-2">
                <li>Provide and improve our services.</li>
                <li>Personalize your experience.</li>
                <li>Analyze usage trends and monitor platform performance.</li>
              </ul>
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Sharing</h2>
            <p className="text-gray-600">
              We do not share your data with third parties unless required by law. In such cases, we will notify you unless prohibited by legal requirements.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-600">
              We use industry-standard encryption and access controls to protect your data. However, no method of transmission over the internet is 100% secure.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. User Rights</h2>
            <p className="text-gray-600">
              You have the right to:
              <ul className="list-disc list-inside mt-2">
                <li>Access your data.</li>
                <li>Request correction or deletion of your data.</li>
                <li>Withdraw consent for data processing.</li>
              </ul>
              To exercise these rights, contact us at <a href="mailto:support@getchatters.com" className="text-green-600">support@getchatters.com</a>.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies and Tracking</h2>
            <p className="text-gray-600">
              We use cookies to enhance your experience. You can manage cookies through your browser settings. For more details, see our <Link to="/cookie-policy" className="text-green-600">Cookie Policy</Link>.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. International Data Transfers</h2>
            <p className="text-gray-600">
              Your data may be transferred to and processed in countries outside your jurisdiction. We ensure such transfers comply with applicable data protection laws.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children’s Privacy</h2>
            <p className="text-gray-600">
              getchatters.com is not intended for children under 13. We do not knowingly collect data from children under 13.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to Policy</h2>
            <p className="text-gray-600">
              We may update this policy from time to time. Continued use of the platform constitutes acceptance of the updated policy.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Information</h2>
            <p className="text-gray-600">
              If you have any questions about this policy, please contact us at <a href="mailto:luke@getchatters.com" className="text-green-600">support@getchatters.com</a>.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;