import type { SVGProps } from 'react';

export function BookIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={className}
      viewBox="0 0 28 22"
      {...props}
    >
      <path
        d="M4 6.2c0-1.38 1.12-2.5 2.5-2.5h6.25a1.25 1.25 0 0 1 1.25 1.25V18.5a1.25 1.25 0 0 0-1.25-1.25H6.4c-1.32 0-2.4-1.07-2.4-2.4V6.2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M24 6.2c0-1.38-1.12-2.5-2.5-2.5h-6.25A1.25 1.25 0 0 0 14 4.95V18.5c0-.69.56-1.25 1.25-1.25h6.35c1.32 0 2.4-1.07 2.4-2.4V6.2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M14 5.1c0-.83.67-1.5 1.5-1.5h5.7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M14 8.4h7.1"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M14 11.2h6.6"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.35"
      />
      <path
        d="M14 14h5.9"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.3"
      />
      <path
        d="M9 5.1c0-.83-.67-1.5-1.5-1.5H1.8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M4.9 8.4h7.1"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M5.4 11.2H12"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.35"
      />
      <path
        d="M6.1 14h5.9"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.3"
      />
      <path
        d="M14 18.25 12.2 17.3a4 4 0 0 0-1.9-.47H6.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M14 18.25l1.8-.95a4 4 0 0 1 1.9-.47h3.8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}
