import React from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings2,
  BarChart4,
  LineChart,
  Smartphone,
  FileText,
  ClipboardList,
  CheckCircle,
} from 'lucide-react';
import Navbar from '../../components/marketing/layout/Navbar';
import Footer from '../../components/marketing/layout/Footer';

const DashboardsPage = () => {
  const features = [
    {
      title: 'Real-Time Data',
      description: 'Track live feedback and resolution metrics as they happen.',
      icon: <BarChart4 className="h-6 w-6 text-black" />,
    },
    {
      title: 'Custom Views',
      description: 'Display only the metrics that matter to you — nothing else.',
      icon: <Settings2 className="h-6 w-6 text-black" />,
    },
    {
      title: 'AI-Powered Insights',
      description: 'Get smart recommendations based on trends in guest sentiment.',
      icon: <LayoutDashboard className="h-6 w-6 text-black" />,
    },
    {
      title: 'Trend Analysis',
      description: 'Spot issues early by tracking guest feedback over time.',
      icon: <LineChart className="h-6 w-6 text-black" />,
    },
    {
      title: 'Anywhere Access',
      description: 'View dashboards from mobile, tablet, or desktop — no installs required.',
      icon: <Smartphone className="h-6 w-6 text-black" />,
    },
    {
      title: 'Exportable Reports',
      description: 'Download and share performance summaries with your team.',
      icon: <FileText className="h-6 w-6 text-black" />,
    },
  ];

  const howItWorks = [
    {
      title: 'Collect Feedback',
      description: 'Guests leave feedback via QR codes at their table — no app needed.',
      icon: <ClipboardList className="h-6 w-6 text-black" />,
    },
    {
      title: 'Track Live Stats',
      description: 'Dashboards update instantly so you can respond in real-time.',
      icon: <LayoutDashboard className="h-6 w-6 text-black" />,
    },
    {
      title: 'Take Action Fast',
      description: 'Use insights to fix issues on the spot and boost 5-star reviews.',
      icon: <CheckCircle className="h-6 w-6 text-black" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-white pt-32 pb-20 text-center px-6">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
          Powerful Dashboards
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
          Monitor guest feedback, track team performance, and fix issues fast — all in one place.
        </p>
      </section>

      {/* Why It Matters */}
      <section className="bg-gray-100 py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">Why Dashboards Matter</h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-12">
            A clear dashboard helps you stay ahead of negative reviews by surfacing the data that matters most — right when it happens.
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
            Chatters dashboards are plug-and-play — just set them up and watch your team’s response time and guest satisfaction improve.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {howItWorks.map((step, index) => (
              <div key={index} className="bg-slate-50 rounded-xl p-6 border border-gray-200">
                <div className="mb-4">{step.icon}</div>
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
          Ready to Explore Chatters Dashboards?
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto mb-8">
          See exactly what your guests are saying — and how fast your team is responding.
        </p>
        <Link
          to="/demo"
          className="inline-block bg-white text-black font-semibold px-6 py-3 rounded-md hover:bg-gray-100 transition"
        >
          Try the Dashboard Free
        </Link>
      </section>

      <Footer />
    </div>
  );
};

export default DashboardsPage;