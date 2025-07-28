import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Eye, Zap, Bell, Smartphone, LineChart } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const RealTimeStatsPage = () => {
  const features = [
    {
      title: 'Live Feedback Updates',
      description: 'View guest feedback the moment it’s submitted — no delay.',
      icon: <Eye className="h-6 w-6 text-black" />,
    },
    {
      title: 'Custom Dashboards',
      description: 'Focus on the metrics that matter most to your venue.',
      icon: <BarChart2 className="h-6 w-6 text-black" />,
    },
    {
      title: 'Instant Alerts',
      description: 'Get notified when negative feedback comes in so you can act fast.',
      icon: <Bell className="h-6 w-6 text-black" />,
    },
    {
      title: 'Trend Analysis',
      description: 'Spot patterns and make data-backed decisions across teams and shifts.',
      icon: <LineChart className="h-6 w-6 text-black" />,
    },
    {
      title: 'Anywhere Access',
      description: 'Check your stats from any device — desktop, tablet or mobile.',
      icon: <Smartphone className="h-6 w-6 text-black" />,
    },
    {
      title: 'AI-Powered Insights',
      description: 'Get recommendations based on customer behaviour and patterns.',
      icon: <Zap className="h-6 w-6 text-black" />,
    },
  ];

  const howItWorks = [
    {
      title: 'Collect Feedback',
      description: 'Guests scan a QR code and share their experience in seconds.',
    },
    {
      title: 'Track in Real-Time',
      description: 'Responses appear instantly in your dashboard, with sentiment alerts.',
    },
    {
      title: 'Take Action Fast',
      description: 'Fix issues before they become negative reviews.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-white pt-32 pb-20 text-center px-6">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
          Real-Time Stats & Insights
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
          Monitor guest feedback, track performance, and fix problems before they reach TripAdvisor.
        </p>
      </section>

      {/* Feature Grid */}
      <section className="bg-gray-100 py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">Why Real-Time Matters</h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-12">
            Visibility in the moment means faster action, happier guests, and fewer bad reviews.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20 px-6 border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">How It Works</h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-12">
            No hardware, no delays, no training needed. Just real-time guest feedback that your team can act on.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {howItWorks.map((step, index) => (
              <div key={index} className="bg-slate-50 rounded-xl p-6 border border-gray-200">
                <div className="text-3xl font-bold text-gray-300 mb-4">0{index + 1}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black py-20 text-center px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          See Real-Time Stats in Action
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto mb-8">
          Get instant visibility into guest experiences — and stop bad reviews before they happen.
        </p>
        <Link
          to="/demo"
          className="inline-block bg-white text-black font-semibold px-6 py-3 rounded-md hover:bg-gray-100 transition"
        >
          Try Chatters Free
        </Link>
      </section>

      <Footer />
    </div>
  );
};

export default RealTimeStatsPage;