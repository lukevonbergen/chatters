// components/marketing/common/sections/PageHeader.jsx
import React from "react";
import { motion, useReducedMotion } from "framer-motion";

const PageHeader = ({
  title = "Page Title",
  description = "Detailed description of what this page is about and what value it provides to users.",
  backgroundGradient = "from-green-50 via-white to-blue-50",
  showSubtitle = false,
  subtitle = "",
  animateOnMount = true, // toggle if needed
}) => {
  const prefersReduced = useReducedMotion();

  const container = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReduced ? 0 : 0.1,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: prefersReduced ? 0 : 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  };

  return (
    <section className={`relative w-full bg-gradient-to-b ${backgroundGradient}`}>
      {/* Dotted texture overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: "radial-gradient(rgba(0,0,0,0.08) 1px, transparent 1px)",
          backgroundSize: "12px 12px",
        }}
        initial={animateOnMount && !prefersReduced ? { opacity: 0 } : false}
        animate={animateOnMount && !prefersReduced ? { opacity: 0.10 } : false}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />

      {/* Content */}
      <motion.div
        className="relative max-w-4xl mx-auto px-6 pt-36 lg:pt-40 pb-24 lg:pb-28 text-center"
        variants={container}
        initial={animateOnMount ? "hidden" : "visible"}
        animate="visible"
      >
        {showSubtitle && subtitle && (
          <motion.p
            className="text-sm lg:text-base font-semibold text-gray-600 mb-4 font-satoshi tracking-wide uppercase"
            variants={item}
          >
            {subtitle}
          </motion.p>
        )}

        <motion.h1
          className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6 font-satoshi leading-tight"
          variants={item}
        >
          {title}
        </motion.h1>

        {description && (
          <motion.p
            className="text-lg lg:text-xl text-gray-700 font-satoshi leading-relaxed max-w-3xl mx-auto"
            variants={item}
          >
            {description}
          </motion.p>
        )}
      </motion.div>
    </section>
  );
};

export default PageHeader;