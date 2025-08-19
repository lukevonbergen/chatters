import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Calendar, Clock, User, Tag, Share2, Twitter, Facebook, Linkedin, Copy, Check } from 'lucide-react';
import Navbar from '../../components/marketing/layout/Navbar';
import Footer from '../../components/marketing/layout/Footer';
import CTASection from '../../components/marketing/sections/CTASection';

const BlogPost = () => {
  const { slug } = useParams();
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  // Sample blog posts data - in a real app this would come from a CMS or API
  const blogPosts = {
    'transforming-customer-feedback-into-revenue': {
      id: 'transforming-customer-feedback-into-revenue',
      title: 'How to Transform Customer Feedback into Revenue Growth',
      excerpt: 'Discover proven strategies to turn customer insights into actionable business improvements that directly impact your bottom line.',
      author: 'Sarah Johnson',
      publishedDate: '2024-08-15',
      readTime: '8 min read',
      category: 'business-insights',
      categoryName: 'Business Insights',
      image: '/img/blog/feedback-revenue.jpg',
      tags: ['Revenue Growth', 'Customer Feedback', 'Business Strategy', 'ROI'],
      content: `
        <p class="lead">In today's competitive business landscape, customer feedback isn't just about satisfaction—it's a goldmine of revenue opportunities waiting to be discovered. Organizations that effectively transform customer insights into actionable business improvements see an average revenue increase of 25% within the first year.</p>

        <h2 id="understanding-feedback-value">Understanding the True Value of Customer Feedback</h2>
        <p>Customer feedback represents direct communication from your market about what's working, what isn't, and most importantly, what opportunities exist for growth. However, most businesses only scratch the surface of this valuable resource.</p>
        
        <p>Research shows that companies using advanced feedback analysis techniques are 60% more likely to retain customers and 40% more successful at identifying new revenue streams.</p>

        <h2 id="collection-strategies">Strategic Feedback Collection</h2>
        <p>The foundation of revenue-driving feedback lies in strategic collection. Rather than generic satisfaction surveys, focus on gathering insights that directly relate to business outcomes:</p>
        
        <ul>
          <li><strong>Purchase Decision Feedback:</strong> Understand what drives customers to buy or prevents them from purchasing</li>
          <li><strong>Feature Demand Analysis:</strong> Identify what additional services or products customers would pay for</li>
          <li><strong>Process Improvement Insights:</strong> Discover operational inefficiencies that cost you customers</li>
          <li><strong>Competitive Intelligence:</strong> Learn why customers choose you over competitors (or vice versa)</li>
        </ul>

        <h2 id="analysis-techniques">Advanced Analysis Techniques</h2>
        <p>Raw feedback is just the beginning. The real value comes from sophisticated analysis that reveals patterns and opportunities:</p>

        <h3>Sentiment Correlation with Revenue</h3>
        <p>By correlating customer sentiment scores with actual purchase behavior and lifetime value, businesses can identify which feedback themes have the strongest impact on revenue. For example, customers who mention "easy to use" are 35% more likely to make repeat purchases.</p>

        <h3>Predictive Feedback Modeling</h3>
        <p>Use historical feedback data to predict which customers are at risk of churning and which are likely to increase their spending. This allows for proactive interventions that can save or grow revenue.</p>

        <h2 id="implementation-framework">Implementation Framework</h2>
        <p>Successfully transforming feedback into revenue requires a systematic approach:</p>

        <h3>Phase 1: Foundation (Weeks 1-4)</h3>
        <ul>
          <li>Establish feedback collection systems across all customer touchpoints</li>
          <li>Implement real-time feedback analysis tools</li>
          <li>Train teams on feedback interpretation and action planning</li>
        </ul>

        <h3>Phase 2: Analysis & Insights (Weeks 5-8)</h3>
        <ul>
          <li>Develop baseline metrics and benchmarks</li>
          <li>Create feedback-to-revenue correlation models</li>
          <li>Identify quick wins and long-term opportunities</li>
        </ul>

        <h3>Phase 3: Action & Optimization (Weeks 9-12)</h3>
        <ul>
          <li>Implement changes based on feedback insights</li>
          <li>Launch targeted campaigns for identified opportunities</li>
          <li>Measure and optimize based on results</li>
        </ul>

        <h2 id="real-world-examples">Real-World Success Stories</h2>
        <p>Consider how leading companies have transformed feedback into revenue:</p>

        <blockquote>
          <p>"By analyzing customer feedback patterns, we discovered that 40% of our customers wanted a premium service tier we didn't offer. Within six months of launching our premium option, it accounted for 30% of our total revenue."</p>
          <footer>— Restaurant Chain CEO</footer>
        </blockquote>

        <h2 id="measuring-success">Measuring Success</h2>
        <p>Track these key metrics to measure the revenue impact of your feedback initiatives:</p>
        
        <ul>
          <li><strong>Customer Lifetime Value (CLV) Growth:</strong> Monitor increases in average customer value</li>
          <li><strong>Retention Rate Improvements:</strong> Track how feedback-driven changes affect customer retention</li>
          <li><strong>New Revenue Stream Performance:</strong> Measure revenue from opportunities identified through feedback</li>
          <li><strong>Cost Reduction:</strong> Calculate savings from operational improvements based on feedback</li>
        </ul>

        <h2 id="future-outlook">The Future of Feedback-Driven Revenue</h2>
        <p>As AI and machine learning technologies continue to evolve, the potential for extracting revenue insights from customer feedback will only increase. Businesses that invest in advanced feedback analysis capabilities today will have a significant competitive advantage tomorrow.</p>

        <p>The key is to view customer feedback not as a cost center or compliance requirement, but as a strategic asset that can drive measurable business growth. With the right approach, every piece of customer feedback becomes a potential pathway to increased revenue.</p>
      `,
      metaDescription: 'Learn proven strategies to transform customer feedback into revenue growth. Discover how to analyze customer insights and turn them into actionable business improvements that drive results.',
      relatedPosts: [
        'restaurant-customer-satisfaction-2024',
        'hotel-guest-experience-optimization',
        'retail-feedback-collection-best-practices'
      ]
    }
  };

  const currentPost = blogPosts[slug];

  const tableOfContents = [
    { id: 'understanding-feedback-value', title: 'Understanding the True Value of Customer Feedback' },
    { id: 'collection-strategies', title: 'Strategic Feedback Collection' },
    { id: 'analysis-techniques', title: 'Advanced Analysis Techniques' },
    { id: 'implementation-framework', title: 'Implementation Framework' },
    { id: 'real-world-examples', title: 'Real-World Success Stories' },
    { id: 'measuring-success', title: 'Measuring Success' },
    { id: 'future-outlook', title: 'The Future of Feedback-Driven Revenue' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sections = tableOfContents.map(item => document.getElementById(item.id)).filter(Boolean);
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i].offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = async (platform) => {
    const url = window.location.href;
    const title = currentPost?.title;
    
    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy URL:', err);
      }
      return;
    }

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  if (!currentPost) {
    return (
      <div className="min-h-screen bg-[#082524]">
        <Navbar />
        <div className="pt-32 pb-20 text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h1 className="text-4xl font-bold text-white mb-6 font-satoshi">Post Not Found</h1>
            <p className="text-gray-200 mb-8 font-satoshi">The blog post you're looking for doesn't exist.</p>
            <Link 
              to="/blog" 
              className="inline-flex items-center bg-[#4ECDC4] text-[#082524] px-6 py-3 rounded-xl font-semibold hover:bg-[#3db8b8] transition-all duration-300 font-satoshi"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Blog
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#082524]">
      <style jsx>{`
        .article-content {
          line-height: 1.75;
          font-size: 1.125rem;
          color: #374151;
        }
        .article-content h2 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1A535C;
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-family: 'Satoshi', sans-serif;
        }
        .article-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1A535C;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          font-family: 'Satoshi', sans-serif;
        }
        .article-content p {
          margin-bottom: 1.5rem;
          font-family: 'Satoshi', sans-serif;
        }
        .article-content p.lead {
          font-size: 1.25rem;
          font-weight: 500;
          color: #4B5563;
          margin-bottom: 2rem;
        }
        .article-content ul, .article-content ol {
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
          font-family: 'Satoshi', sans-serif;
        }
        .article-content li {
          margin-bottom: 0.5rem;
        }
        .article-content strong {
          font-weight: 600;
          color: #1A535C;
        }
        .article-content blockquote {
          border-left: 4px solid #4ECDC4;
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          background-color: #F7FFF7;
          padding: 1.5rem;
          border-radius: 0.5rem;
        }
        .article-content blockquote p {
          margin-bottom: 0.5rem;
          font-size: 1.125rem;
        }
        .article-content blockquote footer {
          font-size: 0.875rem;
          color: #6B7280;
          font-style: normal;
          margin-top: 0.5rem;
        }
      `}</style>
      <Helmet>
        <title>{currentPost.title} | Chatters Blog</title>
        <meta name="description" content={currentPost.metaDescription} />
        <meta name="keywords" content={currentPost.tags.join(', ')} />
        <meta property="og:title" content={`${currentPost.title} | Chatters Blog`} />
        <meta property="og:description" content={currentPost.metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="article:author" content={currentPost.author} />
        <meta property="article:published_time" content={currentPost.publishedDate} />
        <meta property="article:section" content={currentPost.categoryName} />
        {currentPost.tags.map((tag, index) => (
          <meta key={index} property="article:tag" content={tag} />
        ))}
        <link rel="canonical" href={`https://getchatters.com/blog/${currentPost.id}`} />
      </Helmet>

      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-[#082524] pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            to="/blog" 
            className="inline-flex items-center text-[#4ECDC4] hover:text-white transition-colors duration-300 mb-8 font-satoshi"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Blog
          </Link>
          
          <div className="mb-6">
            <span className="bg-[#4ECDC4]/20 text-[#4ECDC4] px-4 py-2 rounded-full text-sm font-semibold font-satoshi">
              {currentPost.categoryName}
            </span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6 font-satoshi">
            {currentPost.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-gray-300 mb-8 font-satoshi">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>{currentPost.author}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(currentPost.publishedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{currentPost.readTime}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-8">
            {currentPost.tags.map((tag, index) => (
              <span key={index} className="bg-white/10 text-white px-3 py-1 rounded-full text-sm font-satoshi">
                #{tag.replace(/\s+/g, '')}
              </span>
            ))}
          </div>

          {/* Share Buttons */}
          <div className="flex items-center space-x-4">
            <span className="text-gray-300 text-sm font-satoshi">Share:</span>
            <button
              onClick={() => handleShare('twitter')}
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-[#1DA1F2] transition-colors duration-300"
            >
              <Twitter className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleShare('facebook')}
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-[#4267B2] transition-colors duration-300"
            >
              <Facebook className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleShare('linkedin')}
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-[#0077B5] transition-colors duration-300"
            >
              <Linkedin className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleShare('copy')}
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-[#4ECDC4] transition-colors duration-300"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </section>

      <div className="bg-white">
        {/* Article Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-4 gap-12">
            {/* Table of Contents - Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-[#1A535C] mb-4 font-satoshi">Table of Contents</h3>
                  <nav className="space-y-2">
                    {tableOfContents.map((item, index) => (
                      <a
                        key={index}
                        href={`#${item.id}`}
                        className={`block text-sm py-2 px-3 rounded-lg transition-colors duration-200 font-satoshi ${
                          activeSection === item.id
                            ? 'bg-[#4ECDC4] text-white'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-[#1A535C]'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          const element = document.getElementById(item.id);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
                      >
                        {item.title}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
            </div>

            {/* Article Content */}
            <div className="lg:col-span-3">
              <article className="prose prose-lg max-w-none">
                <div 
                  className="font-satoshi article-content"
                  dangerouslySetInnerHTML={{ __html: currentPost.content }}
                />
              </article>

              {/* Author Bio */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-[#4ECDC4] rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[#1A535C] font-satoshi">{currentPost.author}</h4>
                    <p className="text-gray-600 font-satoshi">Contributing Writer at Chatters</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-[#1A535C] mb-8 font-satoshi">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Placeholder related articles */}
              {[1, 2, 3].map((i) => (
                <Link 
                  key={i}
                  to="/blog"
                  className="group block bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <div className="bg-gradient-to-br from-[#F7FFF7] to-[#4ECDC4]/5 p-8 h-40 flex items-center justify-center">
                    <div className="w-12 h-12 bg-[#4ECDC4]/20 rounded-xl flex items-center justify-center">
                      <Tag className="w-6 h-6 text-[#4ECDC4]" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-[#1A535C] mb-2 group-hover:text-[#4ECDC4] transition-colors duration-300 font-satoshi">
                      Related Article {i}
                    </h3>
                    <p className="text-gray-600 text-sm font-satoshi">
                      More insights and strategies for your business growth.
                    </p>
                    <div className="mt-4 text-xs text-gray-500 font-satoshi">5 min read</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>

      <CTASection 
        title="Ready to Transform Your Customer Feedback?"
        description="Join thousands of businesses using Chatters to turn customer insights into revenue growth."
        primaryButtonText="Start Free Trial"
        secondaryButtonText="Schedule Demo"
        secondaryButtonLink="/demo"
      />

      <Footer />
    </div>
  );
};

export default BlogPost;