import React from 'react';
import { Helmet } from 'react-helmet';
import Navbar from '../../components/marketing/layout/Navbar';
import Hero from '../../components/marketing/pages/LandingPage/Hero.js';
import Footer from '../../components/marketing/layout/Footer';
import CTA from '../../components/marketing/common/sections/CTA';

const LandingPage = () => {

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Chatters",
    "description": "Real-time customer feedback management platform for restaurants, hotels, and hospitality businesses. Prevent negative reviews, improve customer satisfaction, and protect your reputation.",
    "url": "https://getchatters.com",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, iOS, Android",
    "offers": {
      "@type": "Offer",
      "priceCurrency": "GBP",
      "price": "29.00",
      "priceValidUntil": "2025-12-31",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "500",
      "bestRating": "5",
      "worstRating": "1"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Chatters Ltd",
      "url": "https://getchatters.com"
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Chatters - Real-Time Customer Feedback Management | Prevent Bad Reviews for Restaurants & Hotels</title>
        <meta 
          name="description" 
          content="Stop negative reviews before they happen! Chatters provides real-time customer feedback alerts for restaurants, hotels & hospitality businesses. Get instant notifications, improve satisfaction & protect your reputation. Free trial available."
        />
        <meta 
          name="keywords" 
          content="customer feedback software, restaurant feedback management, prevent negative reviews, real-time alerts, hospitality feedback system, customer satisfaction software, restaurant reputation management, hotel feedback platform, QR code feedback, instant customer alerts"
        />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://getchatters.com/" />
        <meta property="og:title" content="Chatters - Real-Time Customer Feedback Management | Prevent Bad Reviews" />
        <meta property="og:description" content="Stop negative reviews before they happen! Get instant customer feedback alerts for restaurants, hotels & hospitality businesses. Improve satisfaction & protect reputation." />
        <meta property="og:image" content="https://getchatters.com/img/chatters-og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Chatters" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://getchatters.com/" />
        <meta property="twitter:title" content="Chatters - Real-Time Customer Feedback Management | Prevent Bad Reviews" />
        <meta property="twitter:description" content="Stop negative reviews before they happen! Get instant customer feedback alerts for restaurants, hotels & hospitality businesses." />
        <meta property="twitter:image" content="https://getchatters.com/img/chatters-twitter-image.jpg" />
        
        {/* Additional SEO Meta Tags */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="google-site-verification" content="your-google-site-verification-code" />
        <meta name="author" content="Chatters Ltd" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#1A535C" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://getchatters.com/" />
        
        {/* Alternate Language Versions */}
        <link rel="alternate" hreflang="en" href="https://getchatters.com/" />
        <link rel="alternate" hreflang="en-US" href="https://getchatters.com/" />
        <link rel="alternate" hreflang="en-GB" href="https://getchatters.com/" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        
        {/* Additional Structured Data for FAQ */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How does Chatters help prevent negative reviews?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Chatters provides real-time alerts when customers report issues, allowing you to address problems immediately while they're still in your venue, before they leave negative reviews online."
                }
              },
              {
                "@type": "Question", 
                "name": "What types of businesses use Chatters?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Chatters is used by restaurants, hotels, bars, cafes, retail stores, and other hospitality businesses to manage customer feedback and improve satisfaction."
                }
              }
            ]
          })}
        </script>
      </Helmet>

      <Navbar overlay/>

      <Hero />

      <CTA 
        title="Ready to transform your customer feedback?"
        subtitle="Join hundreds of venues already using Chatters to improve their customer experience."
        buttonText="Book a Demo"
        buttonLink="/demo"
      />

      <Footer />
    </div>
  );
};

export default LandingPage;