import React from 'react';
import { Helmet } from 'react-helmet';
import Navbar from '../../components/marketing/layout/Navbar';
import Hero from '../../components/marketing/pages/LandingPage/Hero.js';
import AlternatingSections from '../../components/marketing/common/sections/AlternatingSections.js';
import TestimonialsSection from '../../components/marketing/common/sections/Testimonials.js';
import FAQSection from '../../components/marketing/common/sections/FAQSection.js';
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

      <AlternatingSections
        sections={[
          {
            title: "Resolve feedback quickly",
            description: "Monitoring resolution time is key. Chatters helps you respond to customer feedback in real-time, preventing negative reviews before they happen.",
            image: "/img/homepage/AlternatingSections/AverageResolutionTime-Chatters.svg",
            link: "/demo"
          },
          {
            title: "Reduce negative reviews",
            description: "Knowing when customers are unhappy allows you to resolve issues before they escalate. Chatters helps you maintain a 5-star reputation.",
            image: "/img/homepage/AlternatingSections/PreventBadFeedback.svg",
            link: "/features"
          },
          {
            title: "Optimise staffing",
            description: "Use real-time feedback to adjust staffing levels based on customer flow and feedback trends. Chatters helps you ensure the right staff are in the right place at the right time.",
            image: "/img/homepage/AlternatingSections/OptimiseStaffing.svg",
            link: "/pricing"
          },
        ]}
      />

      <TestimonialsSection
        eyebrow="Testimonials"
        title="Teams prevent bad reviews with Chatters"
        description="A few words from managers and operators using Chatters every day."
        cols={{ base: 1, sm: 1, md: 2, lg: 3 }}
        dottedBackground
        orbGlow
        wavyBottom
        items={[
          {
            quote: "We catch unhappy guests instantly instead of reading it on TripAdvisor the next day.",
            author: "Laura Hughes",
            role: "GM, The King’s Arms",
            avatar: "/img/avatars/laura.jpg",
            logo: "/img/logos/kingsarms.svg",
            rating: 5,
          },
          {
            quote: "Chatters has become part of our daily ops—our team check it like they check tickets.",
            author: "Marcus Doyle",
            role: "Ops Manager, Brew & Co.",
            avatar: "/img/avatars/marcus.jpg",
            logo: "/img/logos/brewco.svg",
            rating: 4.5,
          },
          {
            quote: "We stopped over 50 potential one-star reviews in the first six weeks.",
            author: "Emma Walsh",
            role: "Owner, The Dockside",
            avatar: "/img/avatars/emma.jpg",
            logo: "/img/logos/dockside.svg",
            rating: 5,
          },
          {
            quote: "Staff love it—alerts pop up and they fix problems on the spot.",
            author: "Ryan Turner",
            role: "Floor Manager, Copperhouse Pub",
            avatar: "/img/avatars/ryan.jpg",
            logo: "/img/logos/copperhouse.svg",
            rating: 4.5,
          },
          {
            quote: "We’ve never had a simpler system roll out—no training, just scan and go.",
            author: "Helen Carter",
            role: "Ops Director, Urban Taverns",
            avatar: "/img/avatars/helen.jpg",
            logo: "/img/logos/urbantaverns.svg",
            rating: 5,
          },
          {
            quote: "Our service scores jumped within a month of using Chatters.",
            author: "James O’Neill",
            role: "Owner, The White Hart",
            avatar: "/img/avatars/james.jpg",
            logo: "/img/logos/whitehart.svg",
            rating: 5,
          },
          {
            quote: "We now know exactly where and when issues happen—down to the table.",
            author: "Priya Desai",
            role: "Area Manager, Sun & Stone",
            avatar: "/img/avatars/priya.jpg",
            logo: "/img/logos/sunstone.svg",
            rating: 4.5,
          },
          {
            quote: "Our guests love being listened to in the moment instead of after the fact.",
            author: "Tom Richards",
            role: "Manager, The Railway Inn",
            avatar: "/img/avatars/tom.jpg",
            logo: "/img/logos/railwayinn.svg",
            rating: 5,
          },
          {
            quote: "Simple, effective, and worth every penny—this is a no-brainer for us.",
            author: "Hannah Green",
            role: "Owner, The Crown & Bell",
            avatar: "/img/avatars/hannah.jpg",
            logo: "/img/logos/crownbell.svg",
            rating: 5,
          },
          {
            quote: "We stopped chasing feedback by email—guests just scan the QR and talk to us directly.",
            author: "George Evans",
            role: "Ops Lead, Bar Nine",
            avatar: "/img/avatars/george.jpg",
            logo: "/img/logos/barnine.svg",
            rating: 4.5,
          },
          {
            quote: "Our TripAdvisor page is now full of five-stars instead of mixed reviews.",
            author: "Sophie Martin",
            role: "Owner, The Old Wharf",
            avatar: "/img/avatars/sophie.jpg",
            logo: "/img/logos/oldwharf.svg",
            rating: 5,
          },
          {
            quote: "Instant alerts mean my staff solve problems before I even get to the floor.",
            author: "Daniel Price",
            role: "GM, Riverside Bar & Kitchen",
            avatar: "/img/avatars/daniel.jpg",
            logo: "/img/logos/riverside.svg",
            rating: 5,
          },
          {
            quote: "We prevented a blow-up situation with a large group thanks to Chatters.",
            author: "Lucy Hall",
            role: "Shift Lead, The Watermill",
            avatar: "/img/avatars/lucy.jpg",
            logo: "/img/logos/watermill.svg",
            rating: 4.5,
          },
          {
            quote: "Finally, something built for hospitality that doesn’t need endless onboarding.",
            author: "Chris Bennett",
            role: "Ops Manager, The Red Lion Group",
            avatar: "/img/avatars/chris.jpg",
            logo: "/img/logos/redlion.svg",
            rating: 5,
          },
          {
            quote: "Our guest satisfaction scores are the highest they’ve ever been.",
            author: "Isabella Romano",
            role: "Owner, Trattoria Romano",
            avatar: "/img/avatars/isabella.jpg",
            logo: "/img/logos/romano.svg",
            rating: 5,
          },

        ]}
      />



      <CTA 
        title="Ready to transform your customer feedback?"
        subtitle="Join hundreds of venues already using Chatters to improve their customer experience."
        buttonText="Book a Demo"
        buttonLink="/demo"
      />

       <FAQSection
        eyebrow="Chatters FAQ"
        title="Everything you need to know"
        description="If you have a different question, contact us and we'll help."
        dottedBackground
        wavyBottom = {false}
        backgroundGradient="from-white via-white to-orange-50"
        gradientDirection="bg-gradient-to-b"
        defaultOpenIndex={0}
        faqs={[
          { q: "How do customers leave feedback?", a: "QR codes at tables link to simple forms. Customers scan, rate, and comment in under 30 seconds." },
          { q: "Does it work during busy service?", a: "Yes—alerts are designed for fast-paced restaurant environments with quick resolution flows." },
          { q: "Can we use it across multiple restaurants?", a: "Absolutely. Multi-location management with location-specific insights and comparisons built-in." },
          { q: "What if we get too many alerts?", a: "Smart filtering ensures only actionable issues reach staff, with automatic escalation for serious problems." },
        ]}
      />

      <Footer />
    </div>
  );
};

export default LandingPage;