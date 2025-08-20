import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import PrimaryButton from "../../common/buttons/PrimaryButton";

const Hero = ({
  eyebrow = "Chatters for Hospitality",
  title = "Turn on real-time feedback. Turn off bad reviews.",
  subtitle = "Capture issues at the table, resolve them in minutes, and watch your ratings climb. One dashboard. Instant alerts. Happier guests.",
  primaryCta = { label: "Book a demo", to: "/demo" },
  secondaryCta = { label: "Pricing", to: "/pricing" },
  bullets = [
    "Live alerts to the right staff",
    "No staff training required",
    "Works across all your locations",
  ],
  backgroundGradient = "from-white via-white to-purple-50",
}) => {
  const prefersReduced = useReducedMotion();

  // --- Text animation variants ---
  const container = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReduced ? 0 : 0.4,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: prefersReduced ? 0 : 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" },
    },
  };

  // --- Right card animation ---
  const cardInitial = prefersReduced ? {} : { opacity: 0, x: 32 };
  const cardAnimate = prefersReduced ? {} : { opacity: 1, x: 0 };
  const cardTransition = { duration: 0.45, ease: "easeOut", delay: prefersReduced ? 0 : 0.15 };

  // --- Simulated activity ---
  const [stats, setStats] = useState({ alerts: 12, response: "3m", resolution: 84 });
  const [feedbackItems, setFeedbackItems] = useState([
    { id: 1, table: "Table 213", msg: "I'm still waiting for my food..", status: "Unresolved", isNew: false },
    { id: 2, table: "Table 33", msg: "Just needs assistance", status: "Assistance Request", isNew: false },
    { id: 3, table: "Table 801", msg: "Music is too loud!!", status: "Resolved", isNew: false },
  ]);

  const feedbackPool = [
    { table: "Table 15", msg: "Service is really slow today", status: "Unresolved" },
    { table: "Table 8", msg: "Could we get some extra napkins?", status: "Assistance Request" },
    { table: "Table 42", msg: "The food was cold when it arrived", status: "Unresolved" },
    { table: "Table 23", msg: "WiFi password isn't working", status: "Assistance Request" },
    { table: "Table 67", msg: "Table is a bit wobbly", status: "Assistance Request" },
    { table: "Table 91", msg: "Really happy with the service!", status: "Resolved" },
    { table: "Table 5", msg: "Missing cutlery at our table", status: "Unresolved" },
    { table: "Table 12", msg: "Could we get the check please?", status: "Assistance Request" },
    { table: "Table 34", msg: "The AC is too cold in here", status: "Assistance Request" },
    { table: "Table 7", msg: "Our order is missing the side dish", status: "Unresolved" },
    { table: "Table 19", msg: "Could you turn down the music please?", status: "Assistance Request" },
    { table: "Table 28", msg: "The bathroom needs attention", status: "Unresolved" },
    { table: "Table 56", msg: "We ordered medium but got well done", status: "Unresolved" },
    { table: "Table 3", msg: "Absolutely loved the dessert!", status: "Resolved" },
    { table: "Table 14", msg: "Water glasses need refilling", status: "Assistance Request" },
    { table: "Table 45", msg: "Server was incredibly helpful", status: "Resolved" },
    { table: "Table 22", msg: "Spilled drink on the floor", status: "Assistance Request" },
    { table: "Table 11", msg: "Food took over 45 minutes", status: "Unresolved" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const action = Math.random() < 0.6 ? "add" : "resolve";

      if (action === "add") {
        setFeedbackItems(prev => {
          const currentTables = prev.map(item => item.table);
          const availableFeedback = feedbackPool.filter(f => !currentTables.includes(f.table));
          if (availableFeedback.length === 0) return prev;

          const newFeedback = availableFeedback[Math.floor(Math.random() * availableFeedback.length)];
          const newItem = { id: Date.now(), ...newFeedback, isNew: true };

          setStats(prevStats => ({
            alerts: prevStats.alerts + (newFeedback.status !== "Resolved" ? 1 : 0),
            response: Math.random() < 0.5 ? "2m" : "3m",
            resolution: Math.min(99, prevStats.resolution + Math.floor(Math.random() * 3)),
          }));

          const updated = [newItem, ...prev];
          return updated.slice(0, 4);
        });

        setTimeout(() => {
          setFeedbackItems(prev => prev.map(item => ({ ...item, isNew: false })));
        }, 500);
      } else {
        setFeedbackItems(prev => {
          const unresolved = prev.filter(item => item.status === "Unresolved");
          if (unresolved.length > 0) {
            const itemToResolve = unresolved[0];
            setStats(prevStats => ({ ...prevStats, resolution: Math.min(99, prevStats.resolution + 1) }));
            return prev.map(item =>
              item.id === itemToResolve.id ? { ...item, status: "Resolved", isResolved: true } : item
            );
          }
          return prev;
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Remove resolved items after a short delay (lets exit animation play)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setFeedbackItems(prev => prev.filter(item => !item.isResolved));
    }, 300); // short to keep UI snappy; exit anim handles smoothness
    return () => clearTimeout(timeout);
  }, [feedbackItems]);

  return (
    <section className={`relative w-full bg-gradient-to-b ${backgroundGradient} overflow-hidden`}>
      {/* Subtle dotted texture */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.07,
          backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.15) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
          maskImage: "radial-gradient(ellipse at center, black 70%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 70%, transparent 100%)",
        }}
        initial={prefersReduced ? false : { opacity: 0 }}
        animate={prefersReduced ? false : { opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />

      {/* Decorative blurred orbs */}
      <motion.div
        aria-hidden="true"
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(168,85,247,0.25), transparent)" }}
        initial={prefersReduced ? false : { opacity: 0, scale: 0.95 }}
        animate={prefersReduced ? false : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(59,130,246,0.22), transparent)" }}
        initial={prefersReduced ? false : { opacity: 0, scale: 0.95 }}
        animate={prefersReduced ? false : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
      />

      {/* Content */}
      <div className="relative max-w-[1200px] mx-auto px-6 pt-36 lg:pt-40 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left: Copy */}
          <motion.div
            className="lg:col-span-6 text-left"
            variants={container}
            initial="hidden"
            animate="visible"
          >
            <motion.p
              className="text-xs tracking-widest uppercase font-semibold text-purple-600/80 mb-3"
              variants={item}
            >
              {eyebrow}
            </motion.p>

            <motion.h1
              className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight font-satoshi mb-4"
              variants={item}
            >
              {title}
            </motion.h1>

            <motion.p
              className="text-lg lg:text-xl text-gray-700 leading-relaxed mb-8 max-w-xl"
              variants={item}
            >
              {subtitle}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6"
              variants={item}
            >
              <PrimaryButton text={primaryCta.label} to={primaryCta.to} size="sm" />
              <Link
                to={secondaryCta.to}
                className="group inline-flex items-center font-medium text-black hover:text-gray-900 transition-colors duration-200 font-satoshi"
              >
                <span>{secondaryCta.label}</span>
                <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </motion.div>

            <motion.ul
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700"
              variants={item}
            >
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex p-1 rounded-full bg-green-100 text-green-700">
                    <Check className="w-4 h-4" />
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </motion.ul>

            <motion.div className="mt-8" variants={item}>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">
                Trusted by teams across hospitality & retail
              </p>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 opacity-80">
                <svg width="92" height="20" viewBox="0 0 92 20" className="text-gray-500">
                  <rect width="92" height="20" rx="4" fill="currentColor" opacity="0.2" />
                </svg>
                <svg width="80" height="20" viewBox="0 0 80 20" className="text-gray-500">
                  <rect width="80" height="20" rx="4" fill="currentColor" opacity="0.2" />
                </svg>
                <svg width="70" height="20" viewBox="0 0 70 20" className="text-gray-500">
                  <rect width="70" height="20" rx="4" fill="currentColor" opacity="0.2" />
                </svg>
                <svg width="64" height="20" viewBox="0 0 64 20" className="text-gray-500">
                  <rect width="64" height="20" rx="4" fill="currentColor" opacity="0.2" />
                </svg>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Mock product card */}
          <motion.div
            className="lg:col-span-6"
            initial={cardInitial}
            animate={cardAnimate}
            transition={cardTransition}
          >
            <div className="relative mx-auto w-full max-w-[560px]">
              <div className="relative rounded-2xl border border-gray-200 bg-white shadow-[0_0_24px_rgba(17,24,39,0.06)]">
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <div className="text-xs text-gray-500">Live Feedback</div>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-3 gap-4 mb-5">
                    {[
                      { label: "Today alerts", value: stats.alerts },
                      { label: "Avg. response", value: stats.response },
                      { label: "Resolution rate", value: `${stats.resolution}%` },
                    ].map((s) => (
                      <div key={s.label} className="rounded-xl border border-gray-200 p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900 transition-all duration-300">{s.value}</div>
                        <div className="text-[11px] uppercase tracking-wider text-gray-500 mt-1">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Smoothly-resizing list */}
                  <motion.div layout className="space-y-3">
                    <AnimatePresence initial={false} mode="popLayout">
                      {feedbackItems.map((a) => (
                        <motion.div
                          key={a.id}
                          layout
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.28, ease: "easeOut" }}
                          className={`flex items-center justify-between rounded-xl border border-gray-200 p-3`}
                          style={{ transformOrigin: "top left" }}
                        >
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{a.table}</div>
                            <div className="text-sm text-gray-600">{a.msg}</div>
                          </div>
                          <span
                            className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all duration-300 ${
                              a.status === "Resolved"
                                ? "bg-green-100 text-green-700"
                                : a.status === "Assistance Request"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {a.status}
                          </span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </div>

              <div
                aria-hidden="true"
                className="absolute -inset-6 rounded-3xl blur-2xl"
                style={{ background: "radial-gradient(closest-side, rgba(168,85,247,0.15), transparent 70%)" }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom divider curve */}
      <div className="absolute inset-x-0 bottom-0 h-10">
        <svg className="w-full h-full" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="url(#fade)" />
          <defs>
            <linearGradient id="fade" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
              <stop offset="100%" stopColor="rgba(255,255,255,1)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </section>
  );
};

export default Hero;