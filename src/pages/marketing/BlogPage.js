import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, User, Tag, Search, Filter } from 'lucide-react';
import Navbar from '../../components/marketing/layout/Navbar';
import Footer from '../../components/marketing/layout/Footer';

const BlogPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'All Posts', count: 12 },
    { id: 'customer-experience', name: 'Customer Experience', count: 4 },
    { id: 'business-insights', name: 'Business Insights', count: 3 },
    { id: 'product-updates', name: 'Product Updates', count: 2 },
    { id: 'industry-trends', name: 'Industry Trends', count: 2 },
    { id: 'case-studies', name: 'Case Studies', count: 1 }
  ];

  const blogPosts = [
    {
      id: 'transforming-customer-feedback-into-revenue',
      title: 'How to Transform Customer Feedback into Revenue Growth',
      excerpt: 'Discover proven strategies to turn customer insights into actionable business improvements that directly impact your bottom line.',
      author: 'Sarah Johnson',
      publishedDate: '2024-08-15',
      readTime: '8 min read',
      category: 'business-insights',
      categoryName: 'Business Insights',
      featured: true,
      image: '/img/blog/feedback-revenue.jpg',
      tags: ['Revenue Growth', 'Customer Feedback', 'Business Strategy', 'ROI']
    },
    {
      id: 'restaurant-customer-satisfaction-2024',
      title: 'The State of Restaurant Customer Satisfaction in 2024',
      excerpt: 'Comprehensive analysis of customer satisfaction trends in the restaurant industry, including key metrics and actionable insights.',
      author: 'Mark Thompson',
      publishedDate: '2024-08-12',
      readTime: '6 min read',
      category: 'industry-trends',
      categoryName: 'Industry Trends',
      featured: false,
      image: '/img/blog/restaurant-trends.jpg',
      tags: ['Restaurants', 'Customer Satisfaction', '2024 Trends']
    },
    {
      id: 'real-time-alerts-feature-launch',
      title: 'Introducing Real-Time Alerts: Never Miss Critical Feedback Again',
      excerpt: 'Learn about our new real-time alert system that helps businesses respond to customer concerns instantly.',
      author: 'Tech Team',
      publishedDate: '2024-08-10',
      readTime: '4 min read',
      category: 'product-updates',
      categoryName: 'Product Updates',
      featured: false,
      image: '/img/blog/real-time-alerts.jpg',
      tags: ['Product Update', 'Real-Time Alerts', 'Customer Service']
    },
    {
      id: 'hotel-guest-experience-optimization',
      title: '5 Ways Hotels Can Optimize Guest Experience Through Feedback',
      excerpt: 'Practical strategies for hotels to leverage guest feedback for improved satisfaction and increased bookings.',
      author: 'Lisa Chen',
      publishedDate: '2024-08-08',
      readTime: '7 min read',
      category: 'customer-experience',
      categoryName: 'Customer Experience',
      featured: false,
      image: '/img/blog/hotel-optimization.jpg',
      tags: ['Hotels', 'Guest Experience', 'Optimization', 'Feedback']
    },
    {
      id: 'retail-feedback-collection-best-practices',
      title: 'Best Practices for Retail Feedback Collection',
      excerpt: 'Essential guidelines for retail businesses to collect meaningful customer feedback that drives improvements.',
      author: 'David Park',
      publishedDate: '2024-08-05',
      readTime: '5 min read',
      category: 'customer-experience',
      categoryName: 'Customer Experience',
      featured: false,
      image: '/img/blog/retail-feedback.jpg',
      tags: ['Retail', 'Best Practices', 'Feedback Collection']
    },
    {
      id: 'chatters-dashboard-v3-launch',
      title: 'Dashboard v3.0: Enhanced Analytics and Reporting',
      excerpt: 'Explore the new features in our redesigned dashboard that make data analysis more intuitive and powerful.',
      author: 'Product Team',
      publishedDate: '2024-08-03',
      readTime: '6 min read',
      category: 'product-updates',
      categoryName: 'Product Updates',
      featured: false,
      image: '/img/blog/dashboard-v3.jpg',
      tags: ['Dashboard', 'Analytics', 'Product Update', 'UX']
    }
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-[#082524]">
      <Helmet>
        <title>Blog | Chatters - Customer Feedback Insights & Industry Trends</title>
        <meta 
          name="description" 
          content="Stay updated with the latest customer feedback strategies, industry insights, and product updates from Chatters. Expert advice for restaurants, hotels, and retail businesses."
        />
        <meta 
          name="keywords" 
          content="customer feedback blog, business insights, restaurant tips, hotel management, retail customer experience, feedback strategy"
        />
        <meta property="og:title" content="Blog | Chatters - Customer Feedback Insights" />
        <meta property="og:description" content="Expert insights on customer feedback management, industry trends, and business growth strategies." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://getchatters.com/blog" />
      </Helmet>

      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-[#082524] pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 font-satoshi">
              Insights & 
              <span className="text-[#4ECDC4]"> Industry Trends</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 leading-relaxed font-satoshi">
              Stay ahead with expert insights on customer feedback management, industry trends, and proven strategies to grow your business.
            </p>
            
            {/* Search and Filter Bar */}
            <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent font-satoshi"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-white">
        {/* Categories */}
        <section className="py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 font-satoshi ${
                    selectedCategory === category.id
                      ? 'bg-[#4ECDC4] text-[#082524] shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Post */}
        {featuredPost && selectedCategory === 'all' && !searchTerm && (
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="bg-[#FF6B6B] text-white px-3 py-1 rounded-full text-sm font-semibold font-satoshi">
                    Featured
                  </div>
                  <span className="text-sm text-[#4ECDC4] font-semibold font-satoshi">
                    {featuredPost.categoryName}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-[#1A535C] mb-4 font-satoshi">Featured Article</h2>
              </div>

              <Link 
                to={`/blog/${featuredPost.id}`}
                className="group block bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100"
              >
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="bg-gradient-to-br from-[#F7FFF7] to-[#4ECDC4]/10 p-16 flex items-center">
                    <div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {featuredPost.tags.map((tag, index) => (
                          <span key={index} className="text-xs bg-[#4ECDC4]/20 text-[#1A535C] px-3 py-1 rounded-full font-semibold font-satoshi">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-3xl font-bold text-[#1A535C] mb-4 group-hover:text-[#4ECDC4] transition-colors duration-300 font-satoshi">
                        {featuredPost.title}
                      </h3>
                      <p className="text-gray-600 text-lg leading-relaxed mb-6 font-satoshi">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6 font-satoshi">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>{featuredPost.author}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(featuredPost.publishedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{featuredPost.readTime}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-[#4ECDC4] font-semibold group-hover:text-[#1A535C] transition-colors duration-300 font-satoshi">
                        Read Full Article
                        <ArrowRight className="ml-2 w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-[#4ECDC4]/10 to-[#4ECDC4]/20 p-16 flex items-center justify-center">
                    <div className="w-32 h-32 bg-[#4ECDC4]/30 rounded-3xl flex items-center justify-center">
                      <Tag className="w-16 h-16 text-[#4ECDC4]" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* Blog Posts Grid */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-[#1A535C] font-satoshi">
                {selectedCategory === 'all' ? 'Latest Articles' : `${categories.find(c => c.id === selectedCategory)?.name} Articles`}
              </h2>
              <div className="text-sm text-gray-500 font-satoshi">
                {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} found
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post) => (
                <Link 
                  key={post.id}
                  to={`/blog/${post.id}`}
                  className="group block bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100"
                >
                  <div className="bg-gradient-to-br from-[#F7FFF7] to-[#4ECDC4]/5 p-8 h-48 flex items-center justify-center">
                    <div className="w-16 h-16 bg-[#4ECDC4]/20 rounded-2xl flex items-center justify-center">
                      <Tag className="w-8 h-8 text-[#4ECDC4]" />
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs bg-[#4ECDC4]/20 text-[#1A535C] px-3 py-1 rounded-full font-semibold font-satoshi">
                        {post.categoryName}
                      </span>
                      <div className="text-xs text-gray-500 font-satoshi">{post.readTime}</div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-[#1A535C] mb-3 group-hover:text-[#4ECDC4] transition-colors duration-300 font-satoshi line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 font-satoshi line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-satoshi">
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 2 && (
                        <span className="text-xs text-gray-400 font-satoshi">+{post.tags.length - 2}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 font-satoshi">
                      <div className="flex items-center space-x-2">
                        <User className="w-3 h-3" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(post.publishedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-600 mb-4 font-satoshi">No articles found</h3>
                <p className="text-gray-500 font-satoshi">Try adjusting your search or category filter to find more articles.</p>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-gradient-to-r from-[#1A535C] to-[#4ECDC4] rounded-3xl p-12 text-white">
              <h2 className="text-3xl font-bold mb-4 font-satoshi">Stay Updated</h2>
              <p className="text-xl mb-8 opacity-90 font-satoshi">
                Get the latest insights and industry trends delivered to your inbox weekly.
              </p>
              <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white font-satoshi"
                />
                <button className="bg-white text-[#1A535C] px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-300 font-satoshi">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default BlogPage;