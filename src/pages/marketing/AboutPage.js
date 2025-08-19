import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Smartphone, 
  AlertTriangle, 
  ShieldCheck, 
  Users, 
  BarChart, 
  Globe, 
  Clock, 
  Zap, 
  Target,
  TrendingUp,
  MessageSquare,
  Settings
} from 'lucide-react';
import Navbar from '../../components/marketing/layout/Navbar';
import Footer from '../../components/marketing/layout/Footer';

const AboutUsPage = () => {
  const coreFeatures = [
    {
      title: 'Table QR Feedback',
      description: 'Guests scan QR codes at their table to provide instant feedback while their experience is fresh.',
      icon: <Smartphone className="h-6 w-6 text-black" />,
    },
    {
      title: 'Real-Time Alerts',
      description: 'Staff receive immediate notifications when issues arise, enabling swift action and recovery.',
      icon: <AlertTriangle className="h-6 w-6 text-black" />,
    },
    {
      title: 'Review Protection',
      description: 'Prevent negative reviews by addressing concerns before guests leave your venue.',
      icon: <ShieldCheck className="h-6 w-6 text-black" />,
    },
  ];

  const platformFeatures = [
    {
      title: 'Multi-Venue Management',
      description: 'Manage feedback across multiple locations from a unified dashboard with role-based access.',
      icon: <Globe className="h-6 w-6 text-blue-600" />,
    },
    {
      title: 'Advanced Analytics',
      description: 'Track sentiment trends, response times, and operational metrics with detailed reporting.',
      icon: <BarChart className="h-6 w-6 text-green-600" />,
    },
    {
      title: 'Team Collaboration',
      description: 'Coordinate responses with role-based permissions for managers, staff, and account owners.',
      icon: <Users className="h-6 w-6 text-purple-600" />,
    },
    {
      title: 'Instant Response',
      description: 'Lightning-fast feedback collection and alert delivery in under 10 seconds.',
      icon: <Zap className="h-6 w-6 text-yellow-600" />,
    },
    {
      title: 'Smart Floor Plans',
      description: 'Visual table management with interactive floor plans and zone-based organization.',
      icon: <Target className="h-6 w-6 text-red-600" />,
    },
    {
      title: 'Custom Workflows',
      description: 'Tailored feedback forms and escalation processes that match your venue operations.',
      icon: <Settings className="h-6 w-6 text-gray-600" />,
    },
  ];

  const stats = [
    { number: '10s', label: 'Average Response Time', description: 'From guest feedback to staff notification' },
    { number: '95%', label: 'Issue Resolution', description: 'Problems solved before guests leave' },
    { number: '24/7', label: 'System Uptime', description: 'Reliable monitoring and alerts' },
    { number: '3-Click', label: 'Setup Process', description: 'QR codes live in minutes, not hours' },
  ];

  const teamValues = [
    {
      title: 'Guest-First Thinking',
      description: 'Every feature is designed to improve the guest experience while empowering venue teams.',
      icon: <MessageSquare className="h-8 w-8 text-blue-600" />,
    },
    {
      title: 'Operational Excellence',
      description: 'We understand hospitality operations and build tools that fit seamlessly into existing workflows.',
      icon: <TrendingUp className="h-8 w-8 text-green-600" />,
    },
    {
      title: 'Real-Time Impact',
      description: 'Speed matters in hospitality. Our platform delivers insights and alerts when they can make a difference.',
      icon: <Clock className="h-8 w-8 text-orange-600" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-white pt-32 pb-20 text-center px-6">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">About Chatters</h1>
        <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600 leading-relaxed">
          We're transforming how hospitality venues manage guest feedback with real-time intelligence that prevents problems from becoming public complaints.
        </p>
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900">{stat.number}</div>
              <div className="text-sm font-semibold text-gray-700 mt-1">{stat.label}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.description}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Origin Story */}
      <section className="bg-slate-50 py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Why Chatters Exists</h2>
            <p className="text-gray-600 mb-4 text-lg">
              The hospitality industry has a feedback problem. Guests leave without saying a word about poor service, cold food, or unclean facilities — then blast venues online hours or days later.
            </p>
            <p className="text-gray-600 mb-4">
              We saw incredible teams losing customers and reputation damage — not because they didn't care, but because they found out too late. The traditional comment card was dead, and online reviews came after the damage was done.
            </p>
            <p className="text-gray-600 mb-4">
              So we built a bridge: QR codes that give guests a voice in the moment, and give venues the power to act immediately. No apps to download, no accounts to create — just instant, actionable feedback.
            </p>
            <p className="text-gray-600 font-medium">
              Chatters transforms customer service from reactive damage control to proactive guest recovery.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <img
              src="https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
              alt="Hospitality venue with engaged staff"
              className="rounded-lg w-full h-64 object-cover"
            />
            <p className="mt-4 text-sm text-gray-500 text-center">
              Every venue deserves the tools to deliver exceptional guest experiences.
            </p>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="bg-white py-20 px-6 border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-12 text-lg">
            Three simple steps that transform guest feedback from a post-visit problem into an in-the-moment solution.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {coreFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-slate-50 rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="bg-slate-50 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Enterprise-Grade Platform</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Built for modern hospitality operations with the scale, security, and intelligence that growing venues need.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {platformFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">What Drives Us</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Our principles guide every feature we build and every partnership we forge.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamValues.map((value, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto mb-6 w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology & Architecture */}
      <section className="bg-slate-50 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Built for Scale</h2>
              <p className="text-gray-600 mb-6 text-lg">
                Chatters runs on modern cloud infrastructure designed for the hospitality industry's unique demands — high availability during peak hours, instant global response times, and bulletproof security.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Multi-Tenant SaaS Architecture</h4>
                    <p className="text-gray-600 text-sm">Secure account isolation with role-based access control</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Real-Time Data Pipeline</h4>
                    <p className="text-gray-600 text-sm">Sub-10-second feedback delivery with WebSocket connections</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Advanced Analytics Engine</h4>
                    <p className="text-gray-600 text-sm">Sentiment analysis and trend detection with machine learning</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Mobile-First Design</h4>
                    <p className="text-gray-600 text-sm">Responsive interfaces optimized for all devices and screen sizes</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-lg flex items-center justify-center">
                    <BarChart className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-gray-600 font-medium">Dashboard Analytics Preview</p>
                  <p className="text-gray-500 text-sm mt-1">Real-time insights and reporting</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-gray-900 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Our Mission</h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            To eliminate the gap between guest experience and venue awareness, creating a world where every hospitality business can deliver exceptional service through real-time intelligence.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="text-left">
              <h3 className="text-xl font-semibold mb-4 text-blue-400">For Venues</h3>
              <p className="text-gray-300">
                Empower teams with instant visibility into guest satisfaction, enabling proactive service recovery and continuous improvement.
              </p>
            </div>
            <div className="text-left">
              <h3 className="text-xl font-semibold mb-4 text-green-400">For Guests</h3>
              <p className="text-gray-300">
                Provide a voice that's heard immediately, ensuring concerns are addressed while solutions can still make a difference.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Ready to Transform Your Guest Experience?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8 text-lg">
            Join hundreds of venues that have eliminated bad reviews and recovered unhappy guests with Chatters' real-time feedback platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/demo"
              className="inline-block bg-black text-white font-semibold px-8 py-4 rounded-lg hover:bg-gray-800 transition-colors duration-200"
            >
              Book a Demo
            </Link>
            <Link
              to="/pricing"
              className="inline-block border-2 border-gray-300 text-gray-700 font-semibold px-8 py-4 rounded-lg hover:border-gray-400 transition-colors duration-200"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUsPage;