import React, { useEffect } from 'react';
import { Mail, Phone } from 'lucide-react';
import Navbar from '../../components/marketing/layout/Navbar'; // Import the Navbar component
import Footer from '../../components/marketing/layout/Footer'; // Import the Footer component

const ContactPage = () => {
  // Load HubSpot form script and initialize the form
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//js.hsforms.net/forms/embed/v2.js';
    script.charset = 'utf-8';
    script.async = true;

    script.onload = () => {
      if (window.hbspt) {
        console.log('HubSpot script loaded successfully');
        window.hbspt.forms.create({
          portalId: '48822376',
          formId: 'a4b40ec3-1cf5-422e-a540-e405db7d3d02',
          target: '#hubspot-form',
          css: '', // Disable inline styles
          cssClass: 'your-custom-class', // Add a custom class if needed
          disableInlineStyles: true, // Disable pre-fill
          onFormReady: (form) => {
            console.log('Form is ready', form);
          },
          onFormSubmit: (form) => {
            console.log('Form submitted', form);
          },
        });
      } else {
        console.error('HubSpot script failed to load');
      }
    };

    document.body.appendChild(script);

    // Cleanup script on component unmount
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Use the Navbar component */}
      <Navbar />

      {/* Contact Section */}
      <div className="relative pt-32 pb-16 sm:pt-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 space-y-3 tracking-tight">
              <span className="block">Get in Touch</span>
              <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Contact Us
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
              We'd love to hear from you! Whether you have a question, feedback, or just want to say hello, feel free to reach out.
            </p>
          </div>

          {/* Contact Form and Info */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* HubSpot Form Container */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>
              <div id="hubspot-form"></div> {/* HubSpot form will be injected here */}
            </div>

            {/* Contact Info */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <Mail className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email us at</p>
                    <p className="text-lg font-medium text-gray-900">luke@getchatters.com</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Call us at</p>
                    <p className="text-lg font-medium text-gray-900">+44 7932 065 904</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Use the Footer component */}
      <Footer />
    </div>
  );
};

export default ContactPage;