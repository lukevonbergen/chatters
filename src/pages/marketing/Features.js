import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Zap, Users, Globe, Lock, MessageSquare, BarChart2, Mail, Settings, Shield } from 'lucide-react';
import Navbar from '../../components/marketing/layout/Navbar';
import Footer from '../../components/marketing/layout/Footer';

const FeaturesPage = () => {
  const features = [
    {
      title: 'QR Code Integration',
      description: 'Generate custom QR codes for instant feedback collection at your venue.',
      icon: Globe,
    },
    {
      title: 'Real-time Analytics',
      description: 'Track customer satisfaction metrics and identify trends as they happen.',
      icon: BarChart2,
    },
    {
      title: 'Smart AI Insights',
      description: 'AI-powered recommendations to improve customer experience.',
      icon: Zap,
    },
    {
      title: 'Custom Forms',
      description: 'Create tailored surveys that match your business needs.',
      icon: MessageSquare,
    },
    {
      title: 'Team Collaboration',
      description: 'Share insights and coordinate responses across your team.',
      icon: Users,
    },
    {
      title: 'Enterprise Security',
      description: 'Bank-grade security with SOC 2 Type II compliance.',
      icon: Lock,
    },
    {
      title: 'Email Notifications',
      description: 'Get notified instantly when new feedback is submitted.',
      icon: Mail,
    },
    {
      title: 'Customizable Dashboards',
      description: 'Tailor your analytics dashboard to focus on the metrics that matter most.',
      icon: Settings,
    },
    {
      title: 'Data Encryption',
      description: 'All data is encrypted in transit and at rest for maximum security.',
      icon: Shield,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">

        <Navbar />

      {/* Features Section */}
      <div className="relative pt-32 pb-16 sm:pt-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 space-y-3 tracking-tight">
              <span className="block">Everything You Need to</span>
              <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Succeed
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
              Powerful features designed to help you collect, analyse, and act on customer feedback efficiently.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50">
                    <feature.icon className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                </div>
                <p className="mt-4 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear from businesses that have transformed their customer feedback process with Feedie.app.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Jess',
                role: 'Operations Director - Pub Group',
                testimonial:
                  'Chatters has completely changed how we handle customer feedback. The insights are invaluable!',
              },
              {
                name: 'Steve',
                role: 'Founder - Restaurant',
                testimonial:
                  'The AI-powered recommendations have helped us improve our customer experience significantly.',
              },
              {
                name: 'Sarah',
                role: 'People Lead - Hotel',
                testimonial:
                  'The real-time analytics dashboard is a game-changer. We can now make data-driven decisions instantly.',
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <p className="text-gray-600 italic">"{testimonial.testimonial}"</p>
                <div className="mt-4 flex items-center space-x-3">
                  <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold">{testimonial.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default FeaturesPage;