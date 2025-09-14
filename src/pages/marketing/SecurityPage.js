import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Shield, Lock, Database, Users, FileText, Eye, Server, Key, AlertTriangle, Mail, Settings, Globe, Clock, CheckCircle, Code, Zap } from 'lucide-react';
import Navbar from '../../components/marketing/layout/Navbar';
import Footer from '../../components/marketing/layout/Footer';

const SecurityPage = () => {
  const [activeSection, setActiveSection] = useState('overview');
  
  // Scroll spy functionality
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        'overview', 'architecture', 'authentication', 'data-security', 
        'api-security', 'infrastructure', 'compliance', 'incident-response',
        'vulnerability', 'contact', 'technical'
      ];
      
      const scrollPosition = window.scrollY + 100;
      
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const sidebarItems = [
    { id: 'overview', title: 'Overview', icon: Shield },
    { id: 'architecture', title: 'Architecture Security', icon: Database },
    { id: 'authentication', title: 'Authentication & Authorization', icon: Key },
    { id: 'data-security', title: 'Data Security', icon: Lock },
    { id: 'api-security', title: 'API Security', icon: Server },
    { id: 'infrastructure', title: 'Infrastructure Security', icon: Globe },
    { id: 'compliance', title: 'Compliance & Privacy', icon: FileText },
    { id: 'incident-response', title: 'Incident Response', icon: AlertTriangle },
    { id: 'vulnerability', title: 'Vulnerability Management', icon: Eye },
    { id: 'contact', title: 'Contact & Reporting', icon: Mail },
    { id: 'technical', title: 'Technical Security Measures', icon: Code }
  ];

  return (
    <div className="min-h-screen bg-[#082524]">
      <Helmet>
        <title>Security Documentation | Chatters - Enterprise-Grade Security</title>
        <meta 
          name="description" 
          content="Comprehensive security documentation for Chatters platform. Learn about our security architecture, data protection, compliance measures, and privacy policies."
        />
        <meta 
          name="keywords" 
          content="security documentation, data protection, GDPR compliance, enterprise security, API security, authentication"
        />
        <meta property="og:title" content="Security Documentation | Chatters" />
        <meta property="og:description" content="Enterprise-grade security measures and comprehensive documentation for the Chatters platform." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://getchatters.com/security" />
      </Helmet>

      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-[#082524] pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#4ECDC4]/20">
              <Shield className="h-8 w-8 text-[#4ECDC4]" />
            </div>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6 font-satoshi">
            Security 
            <span className="text-[#4ECDC4]"> Documentation</span>
          </h1>
          <p className="text-xl text-gray-200 mb-8 leading-relaxed font-satoshi max-w-4xl mx-auto">
            Comprehensive security documentation for the Chatters platform. Learn about our security architecture, data protection measures, compliance standards, and privacy policies.
          </p>
          
          {/* Security Notice Banner */}
          <div className="max-w-4xl mx-auto bg-yellow-500/20 border border-yellow-400 rounded-2xl p-6 mb-8">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="w-8 h-8 text-yellow-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-yellow-100 mb-2 font-satoshi">Security Assessment Notice</h3>
                <p className="text-yellow-200 font-satoshi leading-relaxed">
                  We are currently implementing enhanced database security policies to strengthen tenant isolation. 
                  While no customer data has been compromised, this document reflects our current security posture 
                  including identified areas for improvement. Updates are being applied with zero downtime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Sidebar Navigation */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="sticky top-24">
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-[#1A535C] mb-6 font-satoshi">Table of Contents</h3>
                  <nav className="space-y-2">
                    {sidebarItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => scrollToSection(item.id)}
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 font-satoshi ${
                            activeSection === item.id
                              ? 'bg-[#1A535C] text-white font-semibold'
                              : 'hover:bg-gray-100 text-gray-700 hover:text-[#1A535C]'
                          }`}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          <span className="text-sm">{item.title}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 max-w-none prose prose-lg">
              
              {/* Overview Section */}
              <section id="overview" className="mb-16">
                <h2 className="text-3xl font-bold text-[#1A535C] mb-6 font-satoshi flex items-center">
                  <Shield className="w-8 h-8 mr-3 text-[#4ECDC4]" />
                  Overview
                </h2>
                <div className="bg-gray-50 rounded-2xl p-8 mb-8">
                  <p className="text-gray-700 text-lg leading-relaxed font-satoshi mb-6">
                    Chatters is a multi-tenant SaaS platform for hospitality venue feedback management. This document outlines our security architecture, practices, and compliance measures.
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-[#4ECDC4]/20 rounded-xl flex items-center justify-center">
                        <Database className="w-6 h-6 text-[#4ECDC4]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#1A535C] mb-2 font-satoshi">Multi-Tenant Architecture</h4>
                        <p className="text-gray-600 text-sm font-satoshi">Complete data isolation between customer accounts</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-[#4ECDC4]/20 rounded-xl flex items-center justify-center">
                        <Lock className="w-6 h-6 text-[#4ECDC4]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#1A535C] mb-2 font-satoshi">Enterprise Security</h4>
                        <p className="text-gray-600 text-sm font-satoshi">Industry-leading security practices and compliance</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Architecture Security */}
              <section id="architecture" className="mb-16">
                <h2 className="text-3xl font-bold text-[#1A535C] mb-6 font-satoshi flex items-center">
                  <Database className="w-8 h-8 mr-3 text-[#4ECDC4]" />
                  Architecture Security
                </h2>
                
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold text-[#1A535C] mb-4 font-satoshi">Multi-Tenant Data Isolation</h3>
                  <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-6">
                    <h4 className="font-semibold text-red-800 mb-3 font-satoshi flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Security Notice: Current RLS Policy Status
                    </h4>
                    <p className="text-red-700 mb-4 font-satoshi">Our current implementation has identified security gaps that are being addressed:</p>
                    <ul className="space-y-2 text-red-700 font-satoshi">
                      <li className="flex items-start space-x-2">
                        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <span><strong>Database Level:</strong> Some RLS policies are currently over-permissive and allow broader access than intended</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span><strong>Application Level:</strong> Code correctly implements venue-scoped data access</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <span><strong>Database Policies:</strong> Some policies allow any authenticated user to access all venue data</span>
                      </li>
                    </ul>
                    <div className="mt-4 p-4 bg-red-100 rounded-lg">
                      <p className="text-red-800 font-semibold font-satoshi">Action Required:</p>
                      <p className="text-red-700 text-sm font-satoshi">Database policies are being updated to enforce proper tenant isolation. No customer data has been compromised.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900 rounded-xl p-6 mb-6">
                    <h4 className="text-white font-semibold mb-3 font-satoshi">Current RLS Policy Issues</h4>
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-red-400 font-semibold mb-2 font-satoshi">❌ Over-Permissive Policies (Being Fixed):</h5>
                        <pre className="text-red-300 text-sm overflow-x-auto">
{`-- These allow ANY authenticated user to see ALL data:
CREATE POLICY "feedback_authenticated_select" ON feedback 
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "venues_select" ON venues 
  FOR SELECT USING (auth.uid() IS NOT NULL);`}
                        </pre>
                      </div>
                      <div>
                        <h5 className="text-green-400 font-semibold mb-2 font-satoshi">✅ Secure Replacement Policies:</h5>
                        <pre className="text-green-300 text-sm overflow-x-auto">
{`-- These properly scope access to user's venues only:
CREATE POLICY "feedback_venue_access" ON feedback FOR ALL
  USING (venue_id IN (SELECT accessible_venue_ids()));`}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold text-[#1A535C] mb-3 font-satoshi">Data Flow Security:</h4>
                    <p className="text-gray-700 font-satoshi">User authentication → JWT token validation → Account ID resolution → Venue access determination → Data scoping</p>
                  </div>
                </div>
              </section>

              {/* Authentication & Authorization */}
              <section id="authentication" className="mb-16">
                <h2 className="text-3xl font-bold text-[#1A535C] mb-6 font-satoshi flex items-center">
                  <Key className="w-8 h-8 mr-3 text-[#4ECDC4]" />
                  Authentication & Authorization
                </h2>
                
                <div className="mb-8">
                  <div className="bg-blue-50 border-l-4 border-[#4ECDC4] p-6 mb-6">
                    <h4 className="font-semibold text-[#1A535C] mb-3 font-satoshi">Question: How do you handle user authentication?</h4>
                    <ul className="space-y-2 text-gray-700 font-satoshi">
                      <li><strong>Provider:</strong> Supabase Auth (industry-standard authentication service)</li>
                      <li><strong>Method:</strong> JWT tokens with secure session management</li>
                      <li><strong>Password Policy:</strong> Enforced by Supabase (minimum 6 characters, complexity requirements)</li>
                      <li><strong>Session Management:</strong> Automatic token refresh, secure httpOnly cookies</li>
                      <li><strong>Multi-Factor Authentication:</strong> Available through Supabase Auth providers</li>
                    </ul>
                  </div>

                  <h3 className="text-xl font-semibold text-[#1A535C] mb-4 font-satoshi">User Roles & Permissions:</h3>
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                        <Users className="w-6 h-6 text-red-600" />
                      </div>
                      <h4 className="font-semibold text-[#1A535C] mb-2 font-satoshi">admin</h4>
                      <p className="text-gray-600 text-sm font-satoshi">System-wide access (Chatters team only)</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-[#1A535C] mb-2 font-satoshi">master</h4>
                      <p className="text-gray-600 text-sm font-satoshi">Account owner, can manage venues and staff within their account</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                        <Users className="w-6 h-6 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-[#1A535C] mb-2 font-satoshi">manager</h4>
                      <p className="text-gray-600 text-sm font-satoshi">Venue-specific access through staff table relationships</p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6">
                    <h4 className="font-semibold text-yellow-800 mb-3 font-satoshi">Question: How do you prevent unauthorized access between accounts?</h4>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-semibold text-yellow-800 mb-2 font-satoshi">Current Status (Mixed Security Model):</h5>
                        <ol className="space-y-2 text-yellow-700 font-satoshi list-decimal list-inside">
                          <li><strong>✅ Account ID Scoping:</strong> Application code correctly filters by user's account_id</li>
                          <li><strong>✅ Staff Table Relationships:</strong> Managers properly limited to assigned venues</li>
                          <li><strong>✅ VenueContext Isolation:</strong> Frontend correctly filters available venues</li>
                          <li><strong>⚠️ Database Policy Gap:</strong> Some RLS policies allow broader access than application intends</li>
                        </ol>
                      </div>
                      <div className="bg-yellow-100 rounded-lg p-4">
                        <p className="text-yellow-800 font-semibold font-satoshi">Security Assessment:</p>
                        <p className="text-yellow-700 text-sm font-satoshi">While the application code implements proper security controls, database-level policies need tightening to match application intent. This represents defense-in-depth improvements rather than active vulnerabilities.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Data Security */}
              <section id="data-security" className="mb-16">
                <h2 className="text-3xl font-bold text-[#1A535C] mb-6 font-satoshi flex items-center">
                  <Lock className="w-8 h-8 mr-3 text-[#4ECDC4]" />
                  Data Security
                </h2>
                
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold text-[#1A535C] mb-4 font-satoshi">Data Encryption</h3>
                  <div className="bg-blue-50 border-l-4 border-[#4ECDC4] p-6 mb-6">
                    <h4 className="font-semibold text-[#1A535C] mb-3 font-satoshi">Question: How is data encrypted?</h4>
                    <ul className="space-y-2 text-gray-700 font-satoshi">
                      <li><strong>At Rest:</strong> PostgreSQL/Supabase encryption at rest (AES-256)</li>
                      <li><strong>In Transit:</strong> TLS 1.3 for all API communications</li>
                      <li><strong>Database:</strong> All connections use SSL/TLS encryption</li>
                      <li><strong>Backup:</strong> Encrypted backups via Supabase infrastructure</li>
                    </ul>
                  </div>

                  <h3 className="text-2xl font-semibold text-[#1A535C] mb-4 font-satoshi">Sensitive Data Handling</h3>
                  <div className="bg-blue-50 border-l-4 border-[#4ECDC4] p-6">
                    <h4 className="font-semibold text-[#1A535C] mb-3 font-satoshi">Question: How do you handle PII and sensitive data?</h4>
                    
                    <div className="grid md:grid-cols-3 gap-6 mt-4">
                      <div>
                        <h5 className="font-semibold text-[#1A535C] mb-2 font-satoshi">Customer Feedback Data:</h5>
                        <ul className="text-sm text-gray-700 space-y-1 font-satoshi">
                          <li>• No personally identifiable information collected in feedback</li>
                          <li>• Anonymous feedback collection by design</li>
                          <li>• Optional email collection with explicit consent</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-[#1A535C] mb-2 font-satoshi">Staff Data:</h5>
                        <ul className="text-sm text-gray-700 space-y-1 font-satoshi">
                          <li>• Names and emails stored for venue management</li>
                          <li>• No sensitive personal data (SSN, financial info) collected</li>
                          <li>• GDPR-compliant data retention policies</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-[#1A535C] mb-2 font-satoshi">Payment Data:</h5>
                        <ul className="text-sm text-gray-700 space-y-1 font-satoshi">
                          <li>• Stripe handles all payment processing (PCI DSS compliant)</li>
                          <li>• No card details stored in our database</li>
                          <li>• Webhook validation for secure payment notifications</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* API Security */}
              <section id="api-security" className="mb-16">
                <h2 className="text-3xl font-bold text-[#1A535C] mb-6 font-satoshi flex items-center">
                  <Server className="w-8 h-8 mr-3 text-[#4ECDC4]" />
                  API Security
                </h2>
                
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold text-[#1A535C] mb-4 font-satoshi">Endpoint Protection</h3>
                  <div className="bg-blue-50 border-l-4 border-[#4ECDC4] p-6 mb-6">
                    <h4 className="font-semibold text-[#1A535C] mb-3 font-satoshi">Question: How are your APIs secured?</h4>
                    
                    <div className="space-y-6">
                      <div>
                        <h5 className="font-semibold text-[#1A535C] mb-2 font-satoshi">Authentication Required:</h5>
                        <div className="bg-gray-900 rounded-xl p-4">
                          <pre className="text-[#4ECDC4] text-sm overflow-x-auto">
{`// All dashboard APIs require valid JWT
const { data: { session } } = await supabase.auth.getSession();
headers: { 'Authorization': \`Bearer \${session.access_token}\` }`}
                          </pre>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-semibold text-[#1A535C] mb-2 font-satoshi">Authorization Patterns:</h5>
                        <div className="bg-gray-900 rounded-xl p-4">
                          <pre className="text-[#4ECDC4] text-sm overflow-x-auto">
{`// Admin endpoints verify user role
const userData = await requireMasterRole(req);
if (userData.role !== 'master') {
  throw new Error('Insufficient permissions');
}`}
                          </pre>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-semibold text-[#1A535C] mb-2 font-satoshi">Account Scoping:</h5>
                        <div className="bg-gray-900 rounded-xl p-4">
                          <pre className="text-[#4ECDC4] text-sm overflow-x-auto">
{`// All data queries scoped to user's account
.eq('account_id', userData.account_id)`}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-2xl font-semibold text-[#1A535C] mb-4 font-satoshi">Input Validation & Sanitization</h3>
                  <div className="bg-blue-50 border-l-4 border-[#4ECDC4] p-6">
                    <h4 className="font-semibold text-[#1A535C] mb-3 font-satoshi">Question: How do you prevent injection attacks?</h4>
                    <ul className="space-y-2 text-gray-700 font-satoshi">
                      <li><strong>SQL Injection:</strong> Parameterized queries via Supabase SDK</li>
                      <li><strong>XSS Prevention:</strong> React's built-in XSS protection + input sanitization</li>
                      <li><strong>CSRF Protection:</strong> SameSite cookies + origin validation</li>
                      <li><strong>Rate Limiting:</strong> Implemented via Vercel edge functions</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Infrastructure Security */}
              <section id="infrastructure" className="mb-16">
                <h2 className="text-3xl font-bold text-[#1A535C] mb-6 font-satoshi flex items-center">
                  <Globe className="w-8 h-8 mr-3 text-[#4ECDC4]" />
                  Infrastructure Security
                </h2>
                
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold text-[#1A535C] mb-4 font-satoshi">Hosting & Deployment</h3>
                  <div className="bg-blue-50 border-l-4 border-[#4ECDC4] p-6 mb-6">
                    <h4 className="font-semibold text-[#1A535C] mb-3 font-satoshi">Question: What's your infrastructure security posture?</h4>
                    
                    <div className="mb-6">
                      <h5 className="font-semibold text-[#1A535C] mb-3 font-satoshi">Platform Security:</h5>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4">
                          <h6 className="font-semibold text-[#1A535C] mb-2 font-satoshi">Frontend</h6>
                          <p className="text-sm text-gray-700 font-satoshi">Vercel (SOC 2 compliant, DDoS protection)</p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <h6 className="font-semibold text-[#1A535C] mb-2 font-satoshi">Backend</h6>
                          <p className="text-sm text-gray-700 font-satoshi">Supabase (ISO 27001, SOC 2 Type II certified)</p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <h6 className="font-semibold text-[#1A535C] mb-2 font-satoshi">Database</h6>
                          <p className="text-sm text-gray-700 font-satoshi">PostgreSQL on AWS with encryption at rest</p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <h6 className="font-semibold text-[#1A535C] mb-2 font-satoshi">CDN</h6>
                          <p className="text-sm text-gray-700 font-satoshi">Global edge network with automatic HTTPS</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-semibold text-[#1A535C] mb-3 font-satoshi">Access Controls:</h5>
                      <ul className="space-y-2 text-gray-700 font-satoshi">
                        <li><strong>Environment Variables:</strong> Secure secret management</li>
                        <li><strong>Database Access:</strong> Service role keys with minimal required permissions</li>
                        <li><strong>API Keys:</strong> Rotating keys with environment-specific scoping</li>
                      </ul>
                    </div>
                  </div>

                  <h3 className="text-2xl font-semibold text-[#1A535C] mb-4 font-satoshi">Monitoring & Logging</h3>
                  <div className="bg-blue-50 border-l-4 border-[#4ECDC4] p-6">
                    <h4 className="font-semibold text-[#1A535C] mb-3 font-satoshi">Question: How do you monitor for security incidents?</h4>
                    
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <h5 className="font-semibold text-[#1A535C] mb-2 font-satoshi">Error Tracking:</h5>
                        <ul className="text-sm text-gray-700 space-y-1 font-satoshi">
                          <li>• Sentry integration for error monitoring and alerting</li>
                          <li>• Real-time error notifications for security-related issues</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-[#1A535C] mb-2 font-satoshi">Access Logging:</h5>
                        <ul className="text-sm text-gray-700 space-y-1 font-satoshi">
                          <li>• Supabase audit logs for all database access</li>
                          <li>• API endpoint logging with user identification</li>
                          <li>• Failed authentication attempt monitoring</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-[#1A535C] mb-2 font-satoshi">Performance Monitoring:</h5>
                        <ul className="text-sm text-gray-700 space-y-1 font-satoshi">
                          <li>• Vercel Analytics for traffic analysis</li>
                          <li>• Suspicious activity pattern detection</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Compliance & Privacy */}
              <section id="compliance" className="mb-16">
                <h2 className="text-3xl font-bold text-[#1A535C] mb-6 font-satoshi flex items-center">
                  <FileText className="w-8 h-8 mr-3 text-[#4ECDC4]" />
                  Compliance & Privacy
                </h2>
                
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold text-[#1A535C] mb-4 font-satoshi">GDPR Compliance</h3>
                  <div className="bg-blue-50 border-l-4 border-[#4ECDC4] p-6 mb-6">
                    <h4 className="font-semibold text-[#1A535C] mb-3 font-satoshi">Question: Are you GDPR compliant?</h4>
                    
                    <div className="space-y-6">
                      <div>
                        <h5 className="font-semibold text-[#1A535C] mb-2 font-satoshi">Data Minimization:</h5>
                        <ul className="text-gray-700 space-y-1 font-satoshi">
                          <li>• Collect only necessary data for service delivery</li>
                          <li>• Anonymous feedback collection by default</li>
                          <li>• Explicit consent for email collection</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-semibold text-[#1A535C] mb-2 font-satoshi">User Rights:</h5>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-white rounded-lg p-4">
                            <h6 className="font-semibold text-[#1A535C] mb-1 font-satoshi">Right to Access</h6>
                            <p className="text-sm text-gray-700 font-satoshi">Users can export their data via dashboard</p>
                          </div>
                          <div className="bg-white rounded-lg p-4">
                            <h6 className="font-semibold text-[#1A535C] mb-1 font-satoshi">Right to Deletion</h6>
                            <p className="text-sm text-gray-700 font-satoshi">Account deletion removes all associated data</p>
                          </div>
                          <div className="bg-white rounded-lg p-4">
                            <h6 className="font-semibold text-[#1A535C] mb-1 font-satoshi">Right to Rectification</h6>
                            <p className="text-sm text-gray-700 font-satoshi">Users can update their information</p>
                          </div>
                          <div className="bg-white rounded-lg p-4">
                            <h6 className="font-semibold text-[#1A535C] mb-1 font-satoshi">Data Portability</h6>
                            <p className="text-sm text-gray-700 font-satoshi">Export functionality available</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-semibold text-[#1A535C] mb-2 font-satoshi">Legal Basis:</h5>
                        <ul className="text-gray-700 space-y-1 font-satoshi">
                          <li>• Legitimate interest for venue feedback collection</li>
                          <li>• Contract performance for account management</li>
                          <li>• Consent for marketing communications</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-2xl font-semibold text-[#1A535C] mb-4 font-satoshi">Data Retention</h3>
                  <div className="bg-blue-50 border-l-4 border-[#4ECDC4] p-6">
                    <h4 className="font-semibold text-[#1A535C] mb-3 font-satoshi">Question: How long do you retain data?</h4>
                    <ul className="space-y-2 text-gray-700 font-satoshi">
                      <li><strong>Active Accounts:</strong> Data retained while account is active</li>
                      <li><strong>Deleted Accounts:</strong> 30-day soft delete, then permanent removal</li>
                      <li><strong>Feedback Data:</strong> Retained for venue analytics, anonymized after 2 years</li>
                      <li><strong>Audit Logs:</strong> 1-year retention for security purposes</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Incident Response */}
              <section id="incident-response" className="mb-16">
                <h2 className="text-3xl font-bold text-[#1A535C] mb-6 font-satoshi flex items-center">
                  <AlertTriangle className="w-8 h-8 mr-3 text-[#4ECDC4]" />
                  Incident Response
                </h2>
                
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold text-[#1A535C] mb-4 font-satoshi">Security Incident Procedures</h3>
                  <div className="bg-blue-50 border-l-4 border-[#4ECDC4] p-6 mb-6">
                    <h4 className="font-semibold text-[#1A535C] mb-3 font-satoshi">Question: How do you handle security incidents?</h4>
                    
                    <div className="space-y-6">
                      <div>
                        <h5 className="font-semibold text-[#1A535C] mb-2 font-satoshi">Response Team:</h5>
                        <ul className="text-gray-700 space-y-1 font-satoshi">
                          <li><strong>Technical Lead:</strong> Luke von Bergen</li>
                          <li><strong>Security Contact:</strong> security@getchatters.com</li>
                          <li><strong>Escalation:</strong> Immediate notification for data breaches</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-semibold text-[#1A535C] mb-2 font-satoshi">Incident Response Steps:</h5>
                        <div className="space-y-3">
                          {[
                            { step: 1, title: "Detection", desc: "Automated monitoring + user reports" },
                            { step: 2, title: "Assessment", desc: "Impact analysis and containment" },
                            { step: 3, title: "Response", desc: "Immediate remediation and user notification" },
                            { step: 4, title: "Recovery", desc: "System restoration and monitoring" },
                            { step: 5, title: "Post-Incident", desc: "Review and security improvements" }
                          ].map((item) => (
                            <div key={item.step} className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-[#4ECDC4] text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {item.step}
                              </div>
                              <div>
                                <h6 className="font-semibold text-[#1A535C] font-satoshi">{item.title}</h6>
                                <p className="text-sm text-gray-700 font-satoshi">{item.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-semibold text-[#1A535C] mb-2 font-satoshi">Communication:</h5>
                        <ul className="text-gray-700 space-y-1 font-satoshi">
                          <li>• User notification within 24 hours for data breaches</li>
                          <li>• Transparent incident reporting on status page</li>
                          <li>• Regulatory notification as required by GDPR (72 hours)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Vulnerability Management */}
              <section id="vulnerability" className="mb-16">
                <h2 className="text-3xl font-bold text-[#1A535C] mb-6 font-satoshi flex items-center">
                  <Eye className="w-8 h-8 mr-3 text-[#4ECDC4]" />
                  Vulnerability Management
                </h2>
                
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold text-[#1A535C] mb-4 font-satoshi">Security Testing</h3>
                  <div className="bg-blue-50 border-l-4 border-[#4ECDC4] p-6 mb-6">
                    <h4 className="font-semibold text-[#1A535C] mb-3 font-satoshi">Question: How do you test for vulnerabilities?</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-semibold text-[#1A535C] mb-2 font-satoshi">Regular Testing:</h5>
                        <ul className="text-gray-700 space-y-1 font-satoshi">
                          <li>• Dependency vulnerability scanning (automated)</li>
                          <li>• Code review for security issues</li>
                          <li>• Penetration testing (planned quarterly)</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-semibold text-[#1A535C] mb-2 font-satoshi">Third-Party Security:</h5>
                        <ul className="text-gray-700 space-y-1 font-satoshi">
                          <li><strong>Supabase:</strong> Regular security audits and compliance certifications</li>
                          <li><strong>Vercel:</strong> Built-in security scanning and DDoS protection</li>
                          <li><strong>Stripe:</strong> PCI DSS Level 1 compliance for payment processing</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-2xl font-semibold text-[#1A535C] mb-4 font-satoshi">Updates & Patches</h3>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold text-[#1A535C] mb-3 font-satoshi">Security Update Process:</h4>
                    <ul className="text-gray-700 space-y-2 font-satoshi">
                      <li>• Automated dependency updates via GitHub Dependabot</li>
                      <li>• Critical security patches applied within 48 hours</li>
                      <li>• Regular framework and library updates</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Contact & Reporting */}
              <section id="contact" className="mb-16">
                <h2 className="text-3xl font-bold text-[#1A535C] mb-6 font-satoshi flex items-center">
                  <Mail className="w-8 h-8 mr-3 text-[#4ECDC4]" />
                  Contact & Reporting
                </h2>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                      <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-[#1A535C] mb-2 font-satoshi">General Security Inquiries</h4>
                    <p className="text-sm text-gray-700 mb-2 font-satoshi">Email: security@getchatters.com</p>
                    <p className="text-sm text-gray-700 font-satoshi">Response Time: 24 hours for security issues</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                      <AlertTriangle className="w-6 h-6 text-orange-600" />
                    </div>
                    <h4 className="font-semibold text-[#1A535C] mb-2 font-satoshi">Vulnerability Disclosure</h4>
                    <p className="text-sm text-gray-700 mb-2 font-satoshi">Email: security@getchatters.com with subject "SECURITY"</p>
                    <p className="text-sm text-gray-700 mb-2 font-satoshi">Responsible disclosure process</p>
                    <p className="text-sm text-gray-700 font-satoshi">Recognition for valid security findings</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                      <Zap className="w-6 h-6 text-red-600" />
                    </div>
                    <h4 className="font-semibold text-[#1A535C] mb-2 font-satoshi">Emergency Contact</h4>
                    <p className="text-sm text-gray-700 mb-2 font-satoshi">For critical security incidents: security@getchatters.com</p>
                    <p className="text-sm text-gray-700 mb-2 font-satoshi">Include "URGENT" in subject line</p>
                    <p className="text-sm text-gray-700 font-satoshi">24/7 monitoring for critical issues</p>
                  </div>
                </div>
              </section>

              {/* Technical Security Measures */}
              <section id="technical" className="mb-16">
                <h2 className="text-3xl font-bold text-[#1A535C] mb-6 font-satoshi flex items-center">
                  <Code className="w-8 h-8 mr-3 text-[#4ECDC4]" />
                  Technical Security Measures
                </h2>
                
                {/* Security Status Alert */}
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6 mb-8">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-800 mb-2 font-satoshi">Current Security Assessment</h3>
                      <p className="text-yellow-700 mb-4 font-satoshi">
                        Our security team has identified areas for improvement in our database policies. While no data has been compromised, 
                        we are implementing additional security measures to ensure complete tenant isolation.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-green-100 rounded-lg p-4">
                          <h4 className="font-semibold text-green-800 mb-2 font-satoshi">✅ Secure Components:</h4>
                          <ul className="text-green-700 text-sm space-y-1 font-satoshi">
                            <li>• Application-level access controls</li>
                            <li>• Frontend venue filtering</li>
                            <li>• User role enforcement</li>
                            <li>• Account-scoped queries</li>
                          </ul>
                        </div>
                        <div className="bg-yellow-100 rounded-lg p-4">
                          <h4 className="font-semibold text-yellow-800 mb-2 font-satoshi">⚠️ Areas Being Strengthened:</h4>
                          <ul className="text-yellow-700 text-sm space-y-1 font-satoshi">
                            <li>• Database RLS policy tightening</li>
                            <li>• Redundant policy cleanup</li>
                            <li>• Enhanced admin access controls</li>
                            <li>• Additional audit logging</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold text-[#1A535C] mb-4 font-satoshi">Database Security</h3>
                  <div className="mb-6">
                    <h4 className="font-semibold text-[#1A535C] mb-3 font-satoshi">Row Level Security Policies (Under Review):</h4>
                    <div className="space-y-4">
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <h5 className="font-semibold text-red-800 mb-2 font-satoshi">Identified Issues:</h5>
                        <div className="bg-gray-900 rounded-lg p-4">
                          <pre className="text-red-300 text-sm overflow-x-auto">
{`-- These policies are being replaced (too permissive):
CREATE POLICY "feedback_authenticated_select" ON feedback 
  FOR SELECT USING (auth.uid() IS NOT NULL);
  
CREATE POLICY "assistance_requests_authenticated_select" 
  ON assistance_requests FOR SELECT USING (auth.uid() IS NOT NULL);
  
CREATE POLICY "staff_authenticated_access" ON staff 
  FOR ALL USING (auth.uid() IS NOT NULL);`}
                          </pre>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <h5 className="font-semibold text-green-800 mb-2 font-satoshi">Secure Replacement Policies:</h5>
                        <div className="bg-gray-900 rounded-lg p-4">
                          <pre className="text-green-300 text-sm overflow-x-auto">
{`-- New secure policies enforce proper venue scoping:
CREATE POLICY "feedback_venue_access" ON feedback FOR ALL
  USING (venue_id IN (
    SELECT staff.venue_id FROM staff WHERE staff.user_id = auth.uid()
    UNION
    SELECT venues.id FROM venues 
    JOIN users ON venues.account_id = users.account_id 
    WHERE users.id = auth.uid() AND users.role = 'master'
  ));`}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <h4 className="font-semibold text-[#1A535C] mb-3 font-satoshi">Connection Security:</h4>
                    <ul className="text-gray-700 space-y-2 font-satoshi">
                      <li>• SSL-only database connections</li>
                      <li>• Connection pooling with authentication</li>
                      <li>• Service role key rotation</li>
                    </ul>
                  </div>

                  <h3 className="text-2xl font-semibold text-[#1A535C] mb-4 font-satoshi">Application Security</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="font-semibold text-[#1A535C] mb-3 font-satoshi">Frontend Security:</h4>
                      <ul className="text-gray-700 space-y-2 text-sm font-satoshi">
                        <li>• Content Security Policy (CSP) headers</li>
                        <li>• Secure cookie configuration</li>
                        <li>• XSS protection via React</li>
                        <li>• Environment variable protection</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="font-semibold text-[#1A535C] mb-3 font-satoshi">API Security:</h4>
                      <ul className="text-gray-700 space-y-2 text-sm font-satoshi">
                        <li>• CORS configuration for allowed origins</li>
                        <li>• Rate limiting on sensitive endpoints</li>
                        <li>• Input validation and sanitization</li>
                        <li>• SQL injection prevention via ORM</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Security Recommendations Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                  <h4 className="font-semibold text-[#1A535C] mb-4 font-satoshi flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Security Improvement Plan
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-semibold text-[#1A535C] mb-2 font-satoshi">Immediate Actions (Priority 1):</h5>
                      <ul className="text-gray-700 space-y-1 text-sm font-satoshi">
                        <li>• Replace over-permissive RLS policies with venue-scoped access controls</li>
                        <li>• Remove redundant authentication policies that create confusion</li>
                        <li>• Implement proper admin role checking across all policies</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-[#1A535C] mb-2 font-satoshi">Medium-term Improvements (Priority 2):</h5>
                      <ul className="text-gray-700 space-y-1 text-sm font-satoshi">
                        <li>• Add comprehensive audit logging for all data access</li>
                        <li>• Implement additional monitoring for suspicious access patterns</li>
                        <li>• Create automated security policy validation tests</li>
                      </ul>
                    </div>
                    <div className="bg-blue-100 rounded-lg p-4">
                      <p className="text-blue-800 font-semibold font-satoshi mb-1">Timeline:</p>
                      <p className="text-blue-700 text-sm font-satoshi">High-priority security policy updates are being implemented immediately. All improvements will be completed within 30 days with thorough testing.</p>
                    </div>
                  </div>
                </div>

                {/* Document Info */}
                <div className="border-t-2 border-gray-200 pt-8 mt-16">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="text-center text-gray-600 font-satoshi">
                      <p className="mb-2"><strong>Document Version:</strong> 1.1 (Security Assessment Update)</p>
                      <p className="mb-2"><strong>Last Updated:</strong> September 10 2025</p>
                      <p className="mb-2"><strong>Security Review:</strong> In Progress</p>
                      <p className="mb-2"><strong>Next Review:</strong> September 13 2025</p>
                      <p className="text-sm text-red-600"><strong>Note:</strong> This document reflects current security posture including identified improvements</p>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SecurityPage;