import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CTAButton = ({
  children,
  to,
  className = '',
  variant = 'primary' // 'primary' or 'secondary'
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyles = "px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 relative overflow-hidden";

  const variantStyles = {
    primary: "bg-[#2F5CFF] text-white hover:bg-[#2548CC]",
    secondary: "bg-black text-white hover:bg-black/90"
  };

  return (
    <Link
      to={to}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span>{children}</span>

      {/* Arrow container with overflow hidden for the slide effect */}
      <div className="relative w-4 h-4 overflow-hidden">
        {/* First arrow - slides out to the right */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`absolute transition-all duration-300 ease-in-out ${
            isHovered ? 'translate-x-6 opacity-0' : 'translate-x-0 opacity-100'
          }`}
        >
          <path
            d="M3.33334 8H12.6667M12.6667 8L8.00001 3.33333M12.6667 8L8.00001 12.6667"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Second arrow - slides in from the left */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`absolute transition-all duration-300 ease-in-out ${
            isHovered ? 'translate-x-0 opacity-100' : '-translate-x-6 opacity-0'
          }`}
        >
          <path
            d="M3.33334 8H12.6667M12.6667 8L8.00001 3.33333M12.6667 8L8.00001 12.6667"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </Link>
  );
};

export default CTAButton;
