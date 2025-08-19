import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const AlternatingSections = ({
  sections = [],
  gradientDirection = "bg-gradient-to-b",
  backgroundGradient = "from-white via-white to-purple-50"
}) => {
  return (
    <section className={`relative w-full overflow-hidden ${gradientDirection} ${backgroundGradient}`}>
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
              {/* Image */}
              <div className="flex-1">
                <img
                  src={sec.image}
                  alt={sec.title}
                  className="w-full rounded-2xl shadow-md"
                />
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
                    <ArrowRight
                      className="w-5 h-5 ml-1 transform transition-transform duration-200 group-hover:translate-x-1"
                    />
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