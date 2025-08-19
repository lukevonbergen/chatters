import React from 'react';
import { Helmet } from 'react-helmet';
import Navbar from '../../../components/marketing/layout/Navbar';
import Footer from '../../../components/marketing/layout/Footer';
import PageHeader from '../../../components/marketing/common/sections/PageHeader';

const RestaurantSolution = () => {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Hotel Feedback Management | Chatters - Prevent Bad Reviews</title>
        <meta
          name="description"
          content="Transform your hotel's customer experience with Chatters. Get instant feedback, prevent negative reviews, and improve service quality with real-time alerts and analytics."
        />
        <meta
          name="keywords"
          content="hotel feedback software, prevent negative reviews, customer satisfaction, hotel management, real-time alerts, guest experience"
        />
        <meta property="og:title" content="Restaurant Feedback Management | Chatters" />
        <meta property="og:description" content="Get instant customer feedback and prevent negative reviews with Chatters hotel feedback management platform." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://getchatters.com/solutions/hotels" />
      </Helmet>

      {/* Overlay navbar sits above the hero */}
      <Navbar overlay />

      <PageHeader
        title="Hotel Feedback Management That Prevents Bad Reviews"
        description="Give your hotel the power to catch guest concerns during their stay. Turn potential negative reviews into positive experiences with real-time feedback management."
        backgroundGradient="from-white to-purple-200"
        showSubtitle={true}
        subtitle="Hotel Solutions"
      />

      {/* Your page body content goes here */}
      {/* ... */}

      <Footer />
    </div>
  );
};

export default RestaurantSolution;
