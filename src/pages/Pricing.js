import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const PricingPage = () => {
  const pricingPlans = [
    {
      title: 'Reputation Rescue Plan',
      price: '£59',
      description: 'Protect your venue from negative reviews with real-time feedback alerts',
      features: [
        'Unlimited table feedback',
        'Live alerts to catch unhappy guests',
        'Google/TripAdvisor review booster',
        'QR code system (instant setup)',
        'Custom questions & branding',
        'Manager dashboard + support',
      ],
      cta: 'Protect My Reputation',
      ctaLink: '/demo',
      popular: true,
      annualPrice: '£47/month (billed annually)',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Use the Navbar component */}
      <Navbar />

      {/* New Pricing Section */}
      <section>
        {/* Container */}
        <div className="mx-auto max-w-5xl px-5 py-16 md:px-10 md:py-20">
          {/* Heading Container */}
          <div className="mx-auto mb-8 text-center md:mb-12 lg:mb-16">
            {/* Heading */}
            <h2 className="text-3xl md:text-5xl font-bold">Protect Your Reputation for Just £47/month</h2>
            <p className="mt-5 text-gray-500">Simple pricing. No hardware. Cancel anytime.</p>
          </div>

          {/* Content */}
          <div className="mx-auto mb-8 grid grid-cols-[1.25fr] gap-4 rounded-md bg-gray-100 px-16 py-12 md:mb-12 md:grid-cols-[1.25fr_0.25fr_0.75fr] lg:px-20">
            {/* List Feature */}
            <div className="grid h-full grid-cols-1 gap-4 sm:grid-cols-2">
              {pricingPlans[0].features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <img
                    src="https://assets.website-files.com/6458c625291a94a195e6cf3a/6458c625291a9453a6e6cf6e_Vector%20(2).svg"
                    alt=""
                    className="mr-4 inline-block h-4 w-4"
                  />
                  <p className="max-sm:text-sm">{feature}</p>
                </div>
              ))}
            </div>

            {/* Vertical Divider */}
            <div className="mx-auto h-full border border-l-1px"></div>

            {/* Price */}
            <div>
              <h2 className="mb-4 text-3xl font-bold md:text-5xl">
                {pricingPlans[0].price}
                <span className="text-sm font-light sm:text-sm">/month</span>
              </h2>
              <Link
                to={pricingPlans[0].ctaLink}
                className="inline-block w-full rounded-md bg-black px-6 py-3 text-center font-semibold text-white"
              >
                {pricingPlans[0].cta}
              </Link>
              {pricingPlans[0].annualPrice && (
                <p className="mt-2 text-sm text-gray-500">{pricingPlans[0].annualPrice}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Have questions? We've got answers. Check out our FAQ below.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                question: 'Can I cancel my plan?',
                answer: 'Yes, you can cancel your plan at anytime.',
              },
              {
                question: 'Is there a free trial?',
                answer: 'Yes, we offer a 2 week free trial!',
              },
              {
                question: 'What payment methods do you accept?',
                answer: 'We accept all major credit cards and PayPal.',
              },
              {
                question: 'Where can I access my invoices?',
                answer: 'Your invoices will automatically be sent to you at the end of each billing cycle.',
              },
            ].map((faq, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                <p className="mt-2 text-gray-600">{faq.answer}</p>
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

export default PricingPage;
