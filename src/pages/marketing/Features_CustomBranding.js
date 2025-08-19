import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/marketing/layout/Navbar';
import Footer from '../../components/marketing/layout/Footer';

const CustomBrandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-32 pb-16 sm:pt-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 space-y-3 tracking-tight">
              <span className="block">Custom</span>
              <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Branding
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
              Make Chatters your own by adding your logo, colors, and brand identity to create a seamless customer experience.
            </p>
          </div>
        </div>
      </div>

      {/* Why Custom Branding Matters Section */}
      <div className="bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Custom Branding Matters</h2>
              <p className="text-gray-600 mb-4">
                Your brand is more than just a logo—it’s the experience you create for your customers. Custom branding ensures that every touchpoint, including feedback collection, reflects your unique identity.
              </p>
              <p className="text-gray-600 mb-4">
                With Chatters, you can:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4">
                <li><strong>Upload Your Logo:</strong> Add your logo to feedback forms, QR codes, and dashboards.</li>
                <li><strong>Customize Colors:</strong> Match your brand’s color scheme for a cohesive look.</li>
                <li><strong>Create a Seamless Experience:</strong> Ensure customers recognize your brand at every step.</li>
              </ul>
              <p className="text-gray-600 mb-4">
                Custom branding not only enhances your professional image but also builds trust and loyalty with your customers.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <img
                src="https://images.unsplash.com/photo-1526947425960-945c6e72858f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="Custom Branding Example"
                className="rounded-lg"
              />
              <p className="mt-4 text-sm text-gray-500 text-center">
                A feedback form customized with a brand’s logo and colors.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How Custom Branding Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Customizing your branding with Chatters is simple and intuitive. Here’s how it works:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Upload Your Logo',
                  description: 'Easily upload your logo to be displayed on feedback forms, QR codes, and dashboards.',
                  icon: '🖼️',
                },
                {
                  title: 'Choose Your Colors',
                  description: 'Select your brand’s primary and secondary colors to customize the look and feel of your feedback tools.',
                  icon: '🎨',
                },
                {
                  title: 'Preview & Apply',
                  description: 'Preview your custom branding and apply it across all Chatters tools with one click.',
                  icon: '👀',
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="p-6 bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                >
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Benefits of Custom Branding Section */}
      <div className="bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Benefits of Custom Branding</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Custom branding with Chatters offers a range of benefits for your venue:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Professional Image',
                  description: 'A branded feedback system enhances your venue’s professionalism and credibility.',
                  icon: '💼',
                },
                {
                  title: 'Customer Trust',
                  description: 'Customers are more likely to trust and engage with a feedback system that reflects your brand.',
                  icon: '🤝',
                },
                {
                  title: 'Consistent Experience',
                  description: 'Create a cohesive brand experience across all customer touchpoints.',
                  icon: '✨',
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="p-6 bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                >
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Customize Your Branding?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Start creating a seamless brand experience for your customers with Chatters’ custom branding tools.
            </p>
            <Link
              to="/demo"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Get Started with Custom Branding
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CustomBrandingPage;