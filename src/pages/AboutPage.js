import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, AlertTriangle, ShieldCheck } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const AboutUsPage = () => {
  const features = [
    {
      title: 'Table QR Feedback',
      description: 'Let guests scan a code and give feedback in seconds — while they’re still seated.',
      icon: <Smartphone className="h-6 w-6 text-black" />,
    },
    {
      title: 'Live Alerts',
      description: 'Staff get notified the moment something goes wrong, so they can act fast.',
      icon: <AlertTriangle className="h-6 w-6 text-black" />,
    },
    {
      title: 'Review Protection',
      description: 'Catch issues early — before they become 1-star reviews online.',
      icon: <ShieldCheck className="h-6 w-6 text-black" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-white pt-32 pb-20 text-center px-6">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">About Chatters</h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
          Real-time feedback that helps venues fix problems before they turn into public reviews.
        </p>
      </section>

      {/* Origin Story */}
      <section className="bg-slate-50 py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Chatters Exists</h2>
            <p className="text-gray-600 mb-4">
              Chatters started with one problem: venues were getting blindsided by bad reviews — when it was already too late to do anything about it.
            </p>
            <p className="text-gray-600 mb-4">
              We saw teams comp meals, lose loyal customers, and suffer public damage — not because they didn’t care, but because they didn’t know.
            </p>
            <p className="text-gray-600 mb-4">
              So we built a fix: QR codes on every table that let guests speak up before they leave. If something’s off, staff know instantly — and can act in the moment.
            </p>
            <p className="text-gray-600">
              Chatters prevents bad reviews, recovers unhappy guests, and helps great venues stay great — without adding more friction or hardware.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <img
              src="https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
              alt="Local Pub"
              className="rounded-lg"
            />
            <p className="mt-4 text-sm text-gray-500 text-center">
              The original inspiration: a pub, a delayed review, and a missed opportunity.
            </p>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="bg-white py-20 px-6 border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">What We Do</h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-12">
            Chatters helps pubs, bars, and restaurants take control of guest feedback in real time — no hardware, no training, just instant visibility and action.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-slate-50 rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission / CTA */}
      <section className="bg-slate-50 py-20 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why We Care</h2>
        <p className="text-gray-600 max-w-xl mx-auto mb-8">
          Our mission is simple: help great venues avoid bad reviews. We want every team to feel more in control, more connected to guests, and more confident that small issues won’t become big ones.
        </p>
        <Link
          to="/demo"
          className="inline-block bg-black text-white font-semibold px-6 py-3 rounded-md hover:bg-gray-800 transition"
        >
          Book a Demo
        </Link>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUsPage;