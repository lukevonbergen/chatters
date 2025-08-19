import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/marketing/layout/Navbar';
import Footer from '../../components/marketing/layout/Footer';

const QRCodePage = () => {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-32 pb-16 sm:pt-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 space-y-3 tracking-tight">
              <span className="block">QR Codes for</span>
              <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Real-Time Feedback
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
              Discover how QR codes can transform the way your venue collects and acts on customer feedback.
            </p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Why QR Codes?</h2>
              <p className="text-gray-600 mb-4">
                QR codes are a simple yet powerful tool for collecting real-time feedback from your customers. By placing QR codes at strategic locations in your venue, customers can easily scan the code and provide their feedback instantly.
              </p>
              <p className="text-gray-600 mb-4">
                This immediate feedback loop allows you to address any issues before the customer leaves, improving their overall experience and reducing the likelihood of negative reviews.
              </p>
              <p className="text-gray-600 mb-4">
                With Chatters, you can customize your QR codes to match your brand and integrate them seamlessly into your existing customer experience.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <img
                src="https://www.pointingdogcheadle.co.uk/wp-content/uploads/sites/7/2023/10/Pointing-Dog-Bar-1.jpg"
                alt="QR Code Example"
                className="rounded-lg"
              />
              <p className="mt-4 text-sm text-gray-500 text-center">
                A QR code in action—customers can scan and provide feedback instantly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Implementing QR codes in your venue is easy with Chatters. Here’s how it works:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Generate QR Codes',
                  description: 'Create custom QR codes tailored to your venue and brand.',
                  icon: '🖨️',
                },
                {
                  title: 'Place QR Codes',
                  description: 'Strategically place QR codes around your venue for easy access.',
                  icon: '📍',
                },
                {
                  title: 'Collect Feedback',
                  description: 'Customers scan the QR code and provide feedback in real-time.',
                  icon: '📲',
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
      <div className="bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Transform Your Venue?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Start collecting real-time feedback with QR codes today and see the difference it makes for your venue.
            </p>
            <Link
              to="/demo"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Get Started with QR Codes
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default QRCodePage;