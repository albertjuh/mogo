import type { SVGProps } from "react";

export const BodaEmpireIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="18" r="3" />
    <path d="M12 18h-4" />
    <path d="M12 5l-4 4" />
    <path d="M16 5l-8 8" />
    <path d="M9 18V5h10v2" />
  </svg>
);
