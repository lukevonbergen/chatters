// pages/marketing/solutions/RestaurantSolution.jsx
import React from 'react';
import { Helmet } from 'react-helmet';
import Navbar from '../../../components/marketing/layout/Navbar';
import Footer from '../../../components/marketing/layout/Footer';
import PageHeader from '../../../components/marketing/common/sections/PageHeader';

const RestaurantSolution = () => {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Restaurant Feedback Management | Chatters - Prevent Bad Reviews</title>
        <meta
          name="description"
          content="Transform your restaurant's customer experience with Chatters. Get instant feedback, prevent negative reviews, and improve service quality with real-time alerts and analytics."
        />
        <meta
          name="keywords"
          content="restaurant feedback software, prevent negative reviews, customer satisfaction, restaurant management, real-time alerts, dining experience"
        />
        <meta property="og:title" content="Restaurant Feedback Management | Chatters" />
        <meta property="og:description" content="Get instant customer feedback and prevent negative reviews with Chatters restaurant feedback management platform." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://getchatters.com/solutions/restaurants" />
      </Helmet>

      {/* Overlay navbar sits above the hero */}
      <Navbar overlay />

      <PageHeader
        title="Restaurant Feedback Management That Prevents Bad Reviews"
        description="Give your restaurant the power to catch customer concerns before they leave your establishment. Turn potential negative reviews into positive experiences with real-time feedback management."
        backgroundGradient="from-white to-purple-200"
        showSubtitle={true}
        subtitle="Restaurant Solutions"
      />

      {/* Your page body content goes here */}
      {/* ... */}

      <Footer />
    </div>
  );
};

export default RestaurantSolution;
