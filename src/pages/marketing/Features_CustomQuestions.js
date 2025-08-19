import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/marketing/layout/Navbar';
import Footer from '../../components/marketing/layout/Footer';

const CustomQuestionsPage = () => {
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
                Questions
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
              Tailor your feedback forms with custom questions to gather the insights that matter most to your venue.
            </p>
          </div>
        </div>
      </div>

      {/* Why Custom Questions Matter Section */}
      <div className="bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Custom Questions Matter</h2>
              <p className="text-gray-600 mb-4">
                Every venue is unique, and so are the insights you need to improve your customer experience. Custom questions allow you to:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4">
                <li><strong>Gather Specific Feedback:</strong> Ask questions tailored to your venue’s needs, such as food quality, service speed, or ambiance.</li>
                <li><strong>Identify Trends:</strong> Track customer preferences and pain points over time to make data-driven decisions.</li>
                <li><strong>Improve Customer Satisfaction:</strong> Address specific issues and make improvements based on direct feedback.</li>
              </ul>
              <p className="text-gray-600 mb-4">
                With Chatters, you can create custom questions that align with your business goals and customer expectations.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <img
                src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="Custom Questions Example"
                className="rounded-lg"
              />
              <p className="mt-4 text-sm text-gray-500 text-center">
                A feedback form with custom questions tailored to a venue’s needs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How Custom Questions Work</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Creating custom questions with Chatters is simple and flexible. Here’s how it works:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Create Your Questions',
                  description: 'Add custom questions to your feedback forms, such as multiple-choice, rating scales, or open-ended questions.',
                  icon: '📝',
                },
                {
                  title: 'Tailor to Your Needs',
                  description: 'Customize questions to gather insights on specific aspects of your venue, like food, service, or ambiance.',
                  icon: '🎯',
                },
                {
                  title: 'Analyze Responses',
                  description: 'Use Chatters’ analytics tools to track responses and identify trends over time.',
                  icon: '📊',
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

      {/* Benefits of Custom Questions Section */}
      <div className="bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Benefits of Custom Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Custom questions offer a range of benefits for your venue:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Targeted Insights',
                  description: 'Gather feedback on specific areas of your business to make targeted improvements.',
                  icon: '🎯',
                },
                {
                  title: 'Improved Decision-Making',
                  description: 'Use detailed feedback to make data-driven decisions that enhance customer satisfaction.',
                  icon: '📈',
                },
                {
                  title: 'Enhanced Customer Experience',
                  description: 'Address customer concerns and preferences to create a better overall experience.',
                  icon: '🌟',
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
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Create Custom Questions?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Start gathering the insights you need to improve your venue with Chatters’ custom questions feature.
            </p>
            <Link
              to="/demo"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Get Started with Custom Questions
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CustomQuestionsPage;