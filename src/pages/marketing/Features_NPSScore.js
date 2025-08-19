import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/marketing/layout/Navbar';
import Footer from '../../components/marketing/layout/Footer';

const NPSPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-32 pb-16 sm:pt-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 space-y-3 tracking-tight">
              <span className="block">Net Promoter Score</span>
              <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                (NPS)
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
              Measure customer loyalty, improve satisfaction, and grow your business with the power of NPS.
            </p>
          </div>
        </div>
      </div>

      {/* What is NPS Section */}
      <div className="bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What is Net Promoter Score (NPS)?</h2>
              <p className="text-gray-600 mb-4">
                Net Promoter Score (NPS) is a globally recognized metric used to measure customer loyalty and satisfaction. It is based on a simple question:
              </p>
              <blockquote className="p-4 bg-white border-l-4 border-green-600 italic text-gray-600 mb-4">
                "On a scale of 0 to 10, how likely are you to recommend our business to a friend or colleague?"
              </blockquote>
              <p className="text-gray-600 mb-4">
                Customers are categorized into three groups based on their responses:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4">
                <li><strong>Promoters (9-10):</strong> Loyal enthusiasts who will keep buying and refer others.</li>
                <li><strong>Passives (7-8):</strong> Satisfied but unenthusiastic customers who are vulnerable to competitive offerings.</li>
                <li><strong>Detractors (0-6):</strong> Unhappy customers who can damage your brand through negative word-of-mouth.</li>
              </ul>
              <p className="text-gray-600 mb-4">
                The NPS is calculated by subtracting the percentage of Detractors from the percentage of Promoters. The score ranges from -100 to +100, with higher scores indicating greater customer loyalty.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="NPS Score Example"
                className="rounded-lg"
              />
              <p className="mt-4 text-sm text-gray-500 text-center">
                NPS helps businesses understand customer loyalty at a glance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Why NPS Matters Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why NPS Matters for Your Venue</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              NPS is more than just a number—it’s a powerful tool for understanding customer sentiment and driving business growth. Here’s why NPS is essential for your venue:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Measure Customer Loyalty',
                  description: 'NPS provides a clear metric to gauge how loyal your customers are and how likely they are to recommend your venue.',
                  icon: '📈',
                },
                {
                  title: 'Identify Areas for Improvement',
                  description: 'By analyzing feedback from Detractors, you can pinpoint specific issues and take action to improve customer satisfaction.',
                  icon: '🔍',
                },
                {
                  title: 'Drive Business Growth',
                  description: 'Promoters are your biggest advocates. Increasing the number of Promoters can lead to more referrals and repeat business.',
                  icon: '🚀',
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

      {/* How NPS Works Section */}
      <div className="bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How NPS Works with Chatters</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Chatters makes it easy to collect, analyze, and act on NPS feedback. Here’s how it works:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Collect NPS Feedback',
                  description: 'Use QR codes to collect NPS feedback from your customers.',
                  icon: '📋',
                },
                {
                  title: 'Analyze Results',
                  description: 'Chatters provides detailed insights into your NPS score, including trends over time and feedback from Promoters, Passives, and Detractors.',
                  icon: '📊',
                },
                {
                  title: 'Take Action',
                  description: 'Use the insights to address issues, reward Promoters, and improve customer satisfaction.',
                  icon: '✅',
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
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Harness the Power of NPS?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Start measuring customer loyalty and improving your venue’s performance with Chatters’ NPS tools.
            </p>
            <Link
              to="/demo"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Get Started with NPS
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NPSPage;