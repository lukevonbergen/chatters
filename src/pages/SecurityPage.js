import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Key, Database, AlertCircle, Mail, Users, FileText, Eye, Settings, Server, Zap, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const SecurityPage = () => {
  const [expandedSection, setExpandedSection] = useState(null);

  const securityOverview = [
    {
      title: 'Enterprise-Grade Security',
      description: 'Built with security-first architecture using industry-leading practices and compliance standards.',
      icon: Shield,
      color: 'green',
    },
    {
      title: 'Data Encryption',
      description: 'AES-256 encryption at rest and TLS 1.3 in transit. Your data is always protected.',
      icon: Lock,
      color: 'blue',
    },
    {
      title: 'SOC 2 Compliant Infrastructure',
      description: 'Powered by Supabase and Vercel with SOC 2 Type II and ISO 27001 certifications.',
      icon: Database,
      color: 'purple',
    },
    {
      title: 'Multi-Tenant Isolation',
      description: 'Complete data isolation between accounts with role-based access controls.',
      icon: Users,
      color: 'orange',
    },
    {
      title: 'GDPR Compliant',
      description: 'Full compliance with GDPR, CCPA, and other privacy regulations.',
      icon: FileText,
      color: 'red',
    },
    {
      title: '24/7 Monitoring',
      description: 'Continuous security monitoring with real-time threat detection and response.',
      icon: Eye,
      color: 'indigo',
    },
  ];

  const securitySections = [
    {
      title: 'Data Protection & Privacy',
      icon: Shield,
      items: [
        {
          title: 'Anonymous Feedback Collection',
          description: 'Customer feedback is collected anonymously by default - no personal information required.'
        },
        {
          title: 'Data Minimization',
          description: 'We only collect data necessary for service delivery, following GDPR principles.'
        },
        {
          title: 'Right to Deletion',
          description: 'Delete your account and all associated data anytime with our self-service tools.'
        },
        {
          title: 'Data Export',
          description: 'Export all your data in standard formats for portability and compliance.'
        }
      ]
    },
    {
      title: 'Infrastructure Security',
      icon: Server,
      items: [
        {
          title: 'Cloud Security',
          description: 'Hosted on Vercel (frontend) and Supabase (backend) with enterprise-grade security.'
        },
        {
          title: 'Database Security',
          description: 'PostgreSQL with Row Level Security (RLS) policies and encrypted connections.'
        },
        {
          title: 'Network Protection',
          description: 'DDoS protection, WAF, and global CDN with automatic HTTPS enforcement.'
        },
        {
          title: 'Backup & Recovery',
          description: 'Automated encrypted backups with point-in-time recovery capabilities.'
        }
      ]
    },
    {
      title: 'Access Control & Authentication',
      icon: Key,
      items: [
        {
          title: 'Multi-Factor Authentication',
          description: 'Secure your account with MFA via email, SMS, or authenticator apps.'
        },
        {
          title: 'Role-Based Access',
          description: 'Granular permissions system with admin, master, and manager roles.'
        },
        {
          title: 'Session Management',
          description: 'Secure JWT tokens with automatic refresh and session timeout.'
        },
        {
          title: 'Account Isolation',
          description: 'Complete data separation between customer accounts with no cross-contamination.'
        }
      ]
    },
    {
      title: 'Compliance & Auditing',
      icon: FileText,
      items: [
        {
          title: 'GDPR Compliance',
          description: 'Full compliance with European privacy regulations including consent management.'
        },
        {
          title: 'Security Audits',
          description: 'Regular third-party security assessments and penetration testing.'
        },
        {
          title: 'Audit Logging',
          description: 'Comprehensive logging of all data access and system changes for compliance.'
        },
        {
          title: 'Incident Response',
          description: '24-hour incident response with transparent communication and remediation.'
        }
      ]
    }
  ];

  const certifications = [
    { name: 'SOC 2 Type II', description: 'Annual compliance audits for security controls' },
    { name: 'ISO 27001', description: 'International standard for information security management' },
    { name: 'GDPR Compliant', description: 'Full compliance with European privacy regulations' },
    { name: 'PCI DSS', description: 'Payment processing through Stripe (Level 1 PCI DSS)' }
  ];

  const getColorClasses = (color) => {
    const colors = {
      green: 'bg-green-50 text-green-600',
      blue: 'bg-blue-50 text-blue-600',
      purple: 'bg-purple-50 text-purple-600',
      orange: 'bg-orange-50 text-orange-600',
      red: 'bg-red-50 text-red-600',
      indigo: 'bg-indigo-50 text-indigo-600',
    };
    return colors[color] || colors.green;
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-32 pb-16 sm:pt-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 space-y-3 tracking-tight">
              <span className="block">Enterprise-Grade</span>
              <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Security
              </span>
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600">
              Your data security is our top priority. Built with industry-leading security practices, 
              compliance standards, and transparent privacy policies to keep your business protected.
            </p>
          </div>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Security You Can Trust</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive security measures designed for modern businesses
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityOverview.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${getColorClasses(feature.color)}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Security Sections */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Security Framework</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Detailed security measures across every aspect of our platform
            </p>
          </div>
          
          <div className="space-y-6">
            {securitySections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="border border-gray-200 rounded-2xl overflow-hidden">
                <button
                  className="w-full px-8 py-6 bg-gray-50 hover:bg-gray-100 text-left flex items-center justify-between transition-colors"
                  onClick={() => setExpandedSection(expandedSection === sectionIndex ? null : sectionIndex)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100">
                      <section.icon className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
                  </div>
                  {expandedSection === sectionIndex ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                
                {expandedSection === sectionIndex && (
                  <div className="px-8 py-6 bg-white border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {section.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Certifications & Compliance */}
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Certifications & Compliance</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We maintain the highest standards of security and compliance
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <div key={index} className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 mx-auto mb-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{cert.name}</h3>
                <p className="text-sm text-gray-600">{cert.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Contact Section */}
      <div className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-12">
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Security Questions or Concerns?</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Our security team is available to answer questions about our security practices, 
              compliance requirements, or to discuss your specific security needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
              >
                <Mail className="h-5 w-5 mr-2" />
                Contact Security Team
              </Link>
              <a
                href="mailto:security@getchatters.com"
                className="inline-flex items-center px-8 py-4 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <AlertCircle className="h-5 w-5 mr-2" />
                Report Security Issue
              </a>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              For urgent security matters, email us directly at{' '}
              <a href="mailto:security@getchatters.com" className="text-green-600 hover:text-green-700 font-medium">
                security@getchatters.com
              </a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SecurityPage;