import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const PrimaryButton = ({ 
  text = "Book a Demo", 
  to = "/demo",
  size = "lg", // sm, md, lg
  showArrow = true,
  className = "",
  onClick,
  type = "link" // link, button
}) => {
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  const baseClasses = `
    group inline-flex items-center bg-black text-white rounded-lg font-semibold 
    hover:bg-gray-900 transition-all duration-200 font-satoshi shadow-lg hover:shadow-xl
    ${sizeClasses[size]} ${className}
  `.trim();

  const arrowSize = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5';

  if (type === 'button') {
    return (
      <button
        onClick={onClick}
        className={baseClasses}
      >
        <span>{text}</span>
        {showArrow && (
          <ArrowRight className={`${arrowSize} ml-2 transition-transform duration-200 group-hover:translate-x-1`} />
        )}
      </button>
    );
  }

  return (
    <Link 
      to={to}
      className={baseClasses}
    >
      <span>{text}</span>
      {showArrow && (
        <ArrowRight className={`${arrowSize} ml-2 transition-transform duration-200 group-hover:translate-x-1`} />
      )}
    </Link>
  );
};

export default PrimaryButton;