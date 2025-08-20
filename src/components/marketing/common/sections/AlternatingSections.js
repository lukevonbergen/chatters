import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const AlternatingSections = ({
  sections = [],
  gradientDirection = "bg-gradient-to-b",
  backgroundGradient = "from-white via-red-50 to-purple-50",
  showChrome = true
}) => {
  return (
    <section
      className={`relative w-full overflow-hidden ${gradientDirection} ${backgroundGradient}`}
    >
      <div className="relative max-w-[1200px] mx-auto px-6 py-20 space-y-24">
        {sections.map((sec, i) => {
          const flipped = i % 2 === 1; // alternate left/right
          return (
            <div
              key={i}
              className={`flex flex-col lg:flex-row items-center gap-12 ${
                flipped ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Image inside chrome */}
              <div className="flex-1">
                <div className="rounded-2xl border border-gray-200 bg-white shadow-[0_0_24px_rgba(17,24,39,0.06)] overflow-hidden">
                  {showChrome && (
                    <div className="hidden md:flex items-center gap-1.5 px-4 py-2 border-b border-gray-200">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                  )}

                  {/* dotted background wrapper */}
                  <div className="relative bg-[radial-gradient(circle,_rgba(0,0,0,0.05)_1px,_transparent_1px)] [background-size:16px_16px]">
                    <img
                      src={sec.image}
                      alt={sec.title}
                      className="w-full h-auto block"
                    />
                  </div>
                </div>
              </div>

              {/* Text */}
              <div className="flex-1 text-left">
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 font-satoshi">
                  {sec.title}
                </h3>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {sec.description}
                </p>

                {/* Learn More button */}
                {sec.link && (
                  <Link
                    to={sec.link}
                    className="inline-flex items-center text-black font-medium group"
                  >
                    Learn More
                    <ArrowRight className="w-5 h-5 ml-1 transform transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AlternatingSections;