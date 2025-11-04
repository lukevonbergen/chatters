import React from 'react';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Clock, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/marketing/layout/Navbar';
import Footer from '../../../components/marketing/layout/Footer';

const HelpArticle = ({
  title,
  description,
  category,
  categoryColor = "brand",
  readTime = "5 min read",
  lastUpdated = "2025",
  children
}) => {
  const navigate = useNavigate();

  const colorClasses = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
    orange: "bg-orange-100 text-orange-700",
    indigo: "bg-indigo-100 text-indigo-700",
    pink: "bg-pink-100 text-pink-700",
    teal: "bg-teal-100 text-teal-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
    gray: "bg-gray-100 text-gray-700",
    brand: "bg-green-100 text-brand"
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{title} | Chatters Help Center</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={`${title} | Chatters Help Center`} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
      </Helmet>

      <Navbar overlay/>

      <div className="bg-gradient-to-b from-gray-50 to-white pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Back Button */}
          <button
            onClick={() => navigate('/help-new')}
            className="flex items-center text-gray-600 hover:text-brand mb-8 transition-colors font-satoshi"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Help Guides
          </button>

          {/* Category Badge */}
          <div className="mb-4">
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold font-satoshi ${colorClasses[categoryColor]}`}>
              {category}
            </span>
          </div>

          {/* Article Header */}
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 font-satoshi">
            {title}
          </h1>

          <p className="text-xl text-gray-600 mb-8 font-satoshi">
            {description}
          </p>

          {/* Meta Info */}
          <div className="flex items-center space-x-6 text-sm text-gray-500 pb-8 border-b border-gray-200 mb-12">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span className="font-satoshi">{readTime}</span>
            </div>
            <div className="flex items-center">
              <BookOpen className="w-4 h-4 mr-2" />
              <span className="font-satoshi">Last updated: {lastUpdated}</span>
            </div>
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <div className="article-content font-satoshi">
              {children}
            </div>
          </div>

          {/* Help CTA */}
          <div className="mt-16 p-8 bg-blue-50 rounded-2xl border border-blue-200">
            <h3 className="text-xl font-bold text-primary mb-3 font-satoshi">
              Was this article helpful?
            </h3>
            <p className="text-gray-700 mb-6 font-satoshi">
              If you need more help or have questions, our support team is ready to assist you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/help-new"
                className="btn-secondary font-satoshi inline-flex items-center justify-center"
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                Browse More Guides
              </a>
              <a
                href="/contact"
                className="btn-primary font-satoshi inline-flex items-center justify-center"
              >
                Contact Support
              </a>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HelpArticle;
