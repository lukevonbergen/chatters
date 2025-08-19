import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const TextLink = ({
  text = "Learn more",
  to = "/",
  className = "",
  underline = true,
}) => {
  return (
    <Link
      to={to}
      className={`
        group inline-flex items-center font-medium text-black 
        hover:text-gray-900 transition-colors duration-200 font-satoshi
        ${underline ? "underline underline-offset-4" : ""}
        ${className}
      `}
    >
      <span>{text}</span>
      <ArrowRight
        className={`
          w-4 h-4 ml-1 transition-transform duration-200
          group-hover:translate-x-1
        `}
      />
    </Link>
  );
};

export default TextLink;
