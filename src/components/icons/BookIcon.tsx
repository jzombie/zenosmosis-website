import type { SVGProps } from 'react';

export function BookIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={className}
      viewBox="0 0 20 20"
      {...props}
    >
      <path
        d="M3 3.5A1.5 1.5 0 0 1 4.5 2h5A2.5 2.5 0 0 1 12 4.5V16a.5.5 0 0 1-.757.429L8 14.25l-3.243 2.179A.5.5 0 0 1 4 16V3.5Z"
        fill="currentColor"
      />
      <path
        d="M17 3.5V16a.5.5 0 0 1-.757.429L13 14.25l-3.243 2.179A.5.5 0 0 1 9 16V4.5A2.5 2.5 0 0 1 11.5 2h5A.5.5 0 0 1 17 3.5Z"
        fill="currentColor"
        opacity="0.75"
      />
    </svg>
  );
}
