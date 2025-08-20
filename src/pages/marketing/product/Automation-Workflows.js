import React from 'react';
import { Helmet } from 'react-helmet';
import { Workflow, GitBranch, Repeat, Clock, PlayCircle, Settings } from 'lucide-react';
import Navbar from '../../../components/marketing/layout/Navbar';
import PageHeader from '../../../components/marketing/common/sections/PageHeader';
import ContentSplit from '../../../components/marketing/common/sections/ContentSplit';
import ProductFeaturesShowcase from '../../../components/marketing/common/sections/ProductFeaturesShowcase';
import FeatureGrid from '../../../components/marketing/common/sections/FeatureGrid';
import FAQSection from '../../../components/marketing/common/sections/FAQSection';
import CTA from '../../../components/marketing/common/sections/CTA';
import Footer from '../../../components/marketing/layout/Footer';

const AutomationWorkflowsProduct = () => {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Automation Workflows | Chatters - Streamline Your Response Process</title>
        <meta
          name="description"
          content="Automate your feedback management with intelligent workflows. Set up rules that route, escalate, and resolve customer issues automatically, reducing manual work."
        />
        <meta
          name="keywords"
          content="automation workflows, feedback automation, customer service automation, workflow management, automated responses, process automation"
        />
        <meta property="og:title" content="Automation Workflows | Chatters" />
        <meta property="og:description" content="Streamline your feedback management with intelligent automation workflows that handle routing, escalation, and resolution automatically." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://getchatters.com/product/automation-workflows" />
      </Helmet>

      {/* Overlay navbar sits above the hero */}
      <Navbar overlay />

      <PageHeader
        title="Automation Workflows That Handle Feedback While You Focus on Customers"
        description="Set up intelligent workflows that automatically route, escalate, and track feedback resolution. Reduce manual work and ensure no customer concern ever gets missed."
        backgroundGradient="from-white to-purple-200"
        showSubtitle={true}
        subtitle="Automation Workflows"
      />

      <ContentSplit
        eyebrow="Smart Automation"
        eyebrowColour='text-purple-600'
        title="Let workflows handle the routine so you can focus on customers."
        description="Our visual workflow builder lets you create automated processes that route feedback, trigger actions, and ensure proper follow-up - all without requiring technical expertise."
        bullets={[
          "Visual workflow builder",
          "Automated routing rules", 
          "Escalation triggers",
          "Follow-up automation"
        ]}
        primaryCta={{ label: "Build workflows", to: "/signup" }}
        secondaryCta={{ label: "See examples", to: "/demo" }}
        image={{ src: "/img/mock-workflows.png", alt: "Automation workflow interface" }}
      />

      <ProductFeaturesShowcase
        eyebrow="Workflow Intelligence"
        eyebrowColour='text-purple-600'
        title="Automate your way to better customer service."
        description="Build sophisticated workflows that handle complex feedback scenarios automatically, ensuring consistent responses and reducing the burden on your team."
        primaryCta={{ label: "Try automation", to: "/signup" }}
        secondaryCta={{ label: "View templates", to: "/demo" }}
        features={[
          {
            id: "builder",
            eyebrow: "Visual Builder",
            title: "Drag-and-drop workflow creation",
            description: "Build complex workflows visually with our intuitive interface. No coding required - just drag, drop, and configure.",
            bullets: ["Visual flow builder", "Pre-built templates", "Real-time testing"],
            image: { src: "/img/mock-builder.png", alt: "Workflow builder interface" },
          },
          {
            id: "triggers",
            eyebrow: "Smart Triggers",
            title: "Automated routing & escalation",
            description: "Set up rules that automatically route feedback based on content, urgency, location, or any custom criteria.",
            bullets: ["Conditional routing", "Time-based escalation", "Priority detection"],
            image: { src: "/img/mock-triggers.png", alt: "Automation triggers" },
          },
          {
            id: "actions",
            eyebrow: "Automated Actions",
            title: "Follow-up and resolution tracking",
            description: "Automatically send follow-up messages, update status, create tasks, and track resolution progress without manual intervention.",
            bullets: ["Auto-responses", "Task creation", "Status updates"],
            image: { src: "/img/mock-actions.png", alt: "Automated actions" },
          },
        ]}
      />


      <FeatureGrid
        eyebrow="Automation Benefits"
        eyebrowColour='text-purple-600'
        title="Why teams love workflow automation"
        description="Reduce manual work, improve response consistency, and ensure nothing falls through the cracks with intelligent automation."
        gradientDirection="bg-gradient-to-b"
        backgroundGradient="from-white to-purple-50"
        dottedBackground={true}
        orbGlow
        cols={{ base: 1, sm: 2, md: 3, lg: 3 }}
        items={[
          {
            icon: <Workflow className="w-6 h-6 text-purple-600" />,
            title: "Consistent processes",
            description:
              "Workflows ensure every piece of feedback is handled the same way, improving quality and reducing errors.",
          },
          {
            icon: <GitBranch className="w-6 h-6 text-purple-600" />,
            title: "Smart routing logic",
            description:
              "Complex routing rules ensure feedback reaches the right person based on content, urgency, and availability.",
          },
          {
            icon: <Repeat className="w-6 h-6 text-purple-600" />,
            title: "Automated follow-ups",
            description:
              "Never forget to follow up with customers - workflows automatically send check-ins and resolution confirmations.",
          },
          {
            icon: <Clock className="w-6 h-6 text-purple-600" />,
            title: "Time-based triggers",
            description:
              "Set up escalations and reminders based on time - unresolved issues automatically escalate to management.",
          },
          {
            icon: <PlayCircle className="w-6 h-6 text-purple-600" />,
            title: "Instant activation",
            description:
              "Workflows activate immediately when feedback matches your criteria, ensuring rapid response times.",
          },
          {
            icon: <Settings className="w-6 h-6 text-purple-600" />,
            title: "Easy customization",
            description:
              "Modify workflows anytime with our visual builder - no technical skills required to make changes.",
          },
        ]}
        wavyBottom={true}
      />

      <FAQSection
        eyebrow="Automation FAQ"
        eyebrowColour='text-purple-600'
        title="Everything you need to know"
        description="If you have a different question, contact us and we'll help."
        dottedBackground
        orbGlow
        wavyBottom={false}
        backgroundGradient="from-white via-white to-purple-50"
        gradientDirection="bg-gradient-to-b"
        defaultOpenIndex={0}
        faqs={[
          { q: "How complex can workflows be?", a: "As complex as you need - create multi-step workflows with branching logic, conditions, delays, and multiple actions. Our visual builder makes it easy." },
          { q: "Can I test workflows before going live?", a: "Yes - test workflows with sample data to ensure they work correctly before activating them for real feedback." },
          { q: "What happens if a workflow fails?", a: "Failed workflows are logged and flagged for review. Backup processes ensure critical feedback still reaches your team." },
          { q: "Can workflows integrate with other tools?", a: "Yes - workflows can send data to your CRM, create tickets in your help desk, send Slack notifications, and more." },
        ]}
      />

      <CTA 
        title="Automate your way to better customer service" 
        subtitle="Start your free trial and build workflows that handle feedback management automatically."
        buttonText="Book a Demo"
        buttonLink="/demo"
        gradientDirection="bg-gradient-to-r"
        backgroundGradient="from-purple-50 via-white to-indigo-50"
      />


      <Footer />
    </div>
  );
};

export default AutomationWorkflowsProduct;
