import React, { useState, useEffect } from 'react';
import {
  Check,
  Zap,
  Users,
  BarChart2,
  Globe,
  Lock,
  MessageSquare
} from 'lucide-react';
import Navbar from '../../components/marketing/layout/Navbar';
import Footer from '../../components/marketing/layout/Footer';

const DemoPage = () => {
  const [isHubSpotLoaded, setIsHubSpotLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js';
    script.async = true;
    document.body.appendChild(script);
    setIsHubSpotLoaded(true);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="relative pt-32 pb-16 sm:pt-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 tracking-tight mb-6">
            Stop Bad Reviews Before They Happen
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Guests scan a QR code at their table. If something’s wrong, your team gets an instant alert — so you can fix it before they leave a 1-star review.
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-500 mb-10">
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Live in venues right now</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>30-second setup — no hardware</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6 w-full">
            {isHubSpotLoaded ? (
              <div
                className="meetings-iframe-container w-full"
                data-src="https://meetings.hubspot.com/luke-von-bergen/chatters-demo?embed=true"
              ></div>
            ) : (
              <p className="text-sm text-gray-500">
                Booking tool loading… or just{' '}
                <a href="mailto:luke@getchatters.com" className="underline">
                  email me directly
                </a>.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Venues Use Chatters</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Chatters helps pubs, bars and restaurants fix guest issues before they leave — protecting your reputation and improving service in real time.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Real-time Feedback',
                desc: 'Get instant feedback from your customers and see trends as they happen.',
                icon: Zap
              },
              {
                title: 'AI-Powered Insights',
                desc: 'Leverage AI to uncover actionable insights and improve customer experience.',
                icon: BarChart2
              },
              {
                title: 'Easy Integration',
                desc: 'Seamlessly integrate with your existing tools and workflows.',
                icon: Globe
              },
              {
                title: 'Customizable Surveys',
                desc: 'Create surveys that match your brand and gather the data you need.',
                icon: MessageSquare
              },
              {
                title: 'Team Collaboration',
                desc: 'Share insights and collaborate with your team to drive improvements.',
                icon: Users
              },
              {
                title: 'Enterprise Security',
                desc: 'Rest easy knowing your data is secure with SOC 2 Type II compliance.',
                icon: Lock
              }
            ].map((benefit, i) => (
              <div key={i} className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                <div className="relative p-6 bg-white rounded-2xl border border-gray-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50">
                      <benefit.icon className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{benefit.title}</h3>
                  </div>
                  <p className="text-gray-600">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DemoPage;
