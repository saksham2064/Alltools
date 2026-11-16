import React from "react";

interface BrandMarkProps {
  className?: string;
}

export const BrandMark: React.FC<BrandMarkProps> = ({ className = "h-7 w-7" }) => {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="#FEF2E9" stroke="#FADAC2" strokeWidth="1" />
      <rect x="7" y="7" width="8" height="8" rx="2" fill="#F28B45" />
      <rect x="17" y="7" width="8" height="8" rx="2" fill="#202020" />
      <rect x="7" y="17" width="8" height="8" rx="2" fill="#202020" />
      <circle cx="21" cy="21" r="4" fill="#F28B45" />
    </svg>
  );
};
