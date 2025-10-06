import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, User, Tag, Search, Filter } from 'lucide-react';
import Navbar from '../../components/marketing/layout/Navbar';
import PageHeader from '../../components/marketing/common/sections/PageHeader';
import Footer from '../../components/marketing/layout/Footer';

const BlogPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'All Posts', count: 7 },
    { id: 'nps-metrics', name: 'NPS & Metrics', count: 3 },
    { id: 'business-insights', name: 'Business Insights', count: 2 },
    { id: 'customer-experience', name: 'Customer Experience', count: 2 }
  ];

  const blogPosts = [
    {
      id: 'real-time-table-feedback-restaurants',
      title: 'Why Real-Time Feedback at the Table is Transforming UK Restaurants',
      excerpt: 'Discover how capturing guest feedback whilst they\'re still dining allows restaurants to fix issues instantly, prevent negative reviews, and boost satisfaction scores.',
      author: 'Matthew Jackson',
      publishedDate: '2025-10-04',
      readTime: '8 min read',
      category: 'customer-experience',
      categoryName: 'Customer Experience',
      featured: true,
      image: '/img/blog/realtime-table-feedback.jpg',
      tags: ['Real-Time Feedback', 'Table Service', 'Customer Experience', 'QR Codes']
    },
    {
      id: 'complete-guide-to-nps-scores-hospitality',
      title: 'The Complete Guide to NPS Scores for Hospitality Businesses',
      excerpt: 'Everything you need to know about Net Promoter Score: what it is, why it matters, and how to use it to transform your hospitality business.',
      author: 'Matthew Jackson',
      publishedDate: '2025-10-01',
      readTime: '12 min read',
      category: 'nps-metrics',
      categoryName: 'NPS & Metrics',
      featured: false,
      image: '/img/blog/nps-guide.jpg',
      tags: ['NPS', 'Net Promoter Score', 'Customer Loyalty', 'Hospitality Metrics']
    },
    {
      id: 'nps-benchmarks-restaurants-hotels-2024',
      title: 'NPS Benchmarks for Restaurants & Hotels: 2024 Industry Standards',
      excerpt: 'Compare your NPS score against industry benchmarks. Discover what good NPS scores look like for restaurants, pubs, hotels, and other hospitality venues.',
      author: 'Matthew Jackson',
      publishedDate: '2025-08-15',
      readTime: '9 min read',
      category: 'nps-metrics',
      categoryName: 'NPS & Metrics',
      featured: false,
      image: '/img/blog/nps-benchmarks.jpg',
      tags: ['NPS', 'Benchmarks', 'Industry Standards', 'Hospitality']
    },
    {
      id: 'improving-nps-score-practical-strategies',
      title: 'How to Improve Your NPS Score: 10 Practical Strategies That Work',
      excerpt: 'Proven tactics to boost your Net Promoter Score and turn more customers into promoters. Real-world strategies from successful hospitality businesses.',
      author: 'Matthew Jackson',
      publishedDate: '2025-07-01',
      readTime: '10 min read',
      category: 'nps-metrics',
      categoryName: 'NPS & Metrics',
      featured: false,
      image: '/img/blog/improve-nps.jpg',
      tags: ['NPS', 'Customer Satisfaction', 'Strategy', 'Best Practices']
    },
    {
      id: 'nps-vs-csat-customer-satisfaction-metrics',
      title: 'NPS vs CSAT vs CES: Which Customer Satisfaction Metric Should You Track?',
      excerpt: 'Understand the differences between NPS, CSAT, and Customer Effort Score. Learn which metrics matter most for your hospitality business.',
      author: 'Matthew Jackson',
      publishedDate: '2025-06-01',
      readTime: '7 min read',
      category: 'business-insights',
      categoryName: 'Business Insights',
      featured: false,
      image: '/img/blog/metrics-comparison.jpg',
      tags: ['NPS', 'CSAT', 'CES', 'Metrics', 'Customer Satisfaction']
    },
    {
      id: 'calculating-nps-score-step-by-step',
      title: 'How to Calculate NPS Score: Step-by-Step Guide with Examples',
      excerpt: 'Master the NPS calculation formula with real examples. Learn how to segment your score, track trends, and interpret results correctly.',
      author: 'Matthew Jackson',
      publishedDate: '2025-05-15',
      readTime: '6 min read',
      category: 'business-insights',
      categoryName: 'Business Insights',
      featured: false,
      image: '/img/blog/calculate-nps.jpg',
      tags: ['NPS', 'Calculation', 'Analytics', 'Tutorial']
    },
    {
      id: 'qr-code-feedback-systems-restaurants',
      title: 'QR Code Feedback Systems: The Complete Guide for UK Restaurants',
      excerpt: 'Learn how QR code feedback collection works, why it\'s more effective than traditional surveys, and how to implement it in your restaurant or pub.',
      author: 'Matthew Jackson',
      publishedDate: '2025-09-20',
      readTime: '9 min read',
      category: 'customer-experience',
      categoryName: 'Customer Experience',
      featured: false,
      image: '/img/blog/qr-feedback.jpg',
      tags: ['QR Codes', 'Feedback Collection', 'Restaurant Technology', 'Guest Experience']
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
    <div className="min-h-screen bg-slate-50">
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

      <Navbar overlay/>

      <PageHeader
        title="Chatters Blog"
        description="The Chatters Blog is your go-to resource for the latest insights on customer feedback management, industry trends, and business growth strategies. Explore expert articles, case studies, and product updates to help you enhance your customer experience."
        backgroundGradient="from-white to-blue-50"
        showSubtitle={true}
        subtitle="Support & Resources"
      />

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
                  <div className="relative h-full min-h-[400px] overflow-hidden bg-gradient-to-br from-[#1A535C] to-[#4ECDC4]">
                    <img
                      src={`https://images.unsplash.com/photo-${featuredPost.id === 'real-time-table-feedback-restaurants' ? '1414235077428-338989a2e8c0' : featuredPost.id === 'qr-code-feedback-systems-restaurants' ? '1556742049-0cfed4f6a45d' : '1517248135467-4c7edcad34c4'}?auto=format&fit=crop&w=1200&q=80`}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A535C]/50 to-transparent"></div>
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
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#1A535C] to-[#4ECDC4]">
                    <img
                      src={`https://images.unsplash.com/photo-${post.id === 'real-time-table-feedback-restaurants' ? '1414235077428-338989a2e8c0' : post.id === 'qr-code-feedback-systems-restaurants' ? '1556742049-0cfed4f6a45d' : post.id === 'complete-guide-to-nps-scores-hospitality' ? '1517248135467-4c7edcad34c4' : post.id === 'nps-benchmarks-restaurants-hotels-2024' ? '1551218808-94e220e084d2' : post.id === 'improving-nps-score-practical-strategies' ? '1466978913421-dad2ebd01d17' : post.id === 'nps-vs-csat-customer-satisfaction-metrics' ? '1460925895917-afdab827c52f' : '1551218808-94e220e084d2'}?auto=format&fit=crop&w=800&q=80`}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
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