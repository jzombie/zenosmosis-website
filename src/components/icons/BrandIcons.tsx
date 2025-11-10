import { useId } from 'react';
import type { SVGProps } from 'react';

const baseProps = {
  'aria-hidden': 'true',
  focusable: 'false',
} as const;

export const GitHubMark = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    {...baseProps}
    {...props}
    className={className}
    viewBox="0 0 16 16"
  >
    <path
      fillRule="evenodd"
      d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.52 7.52 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8"
    />
  </svg>
);

export const RustGearMark = ({ className, ...props }: SVGProps<SVGSVGElement>) => {
  const maskId = useId();

  return (
    <svg
      {...baseProps}
      {...props}
      className={className}
      viewBox="0 0 106 106"
    >
      <g transform="translate(53 53)">
        <path
          d="M-9 -15h13c8 0 8 8 0 8H-9ZM-40 22H0V11h-9V3H1c11 0 5 19 14 19H40V3h-6v2c0 8-9 7-10 2-1-5-5-9-6-9 15-8 6-24-6-24H-35v11h10V11H-40Z"
          fill="currentColor"
          stroke="none"
        />

        <mask id={maskId}>
          <rect x="-60" y="-60" width="120" height="120" fill="white" />
          {[0, 72, 144, 216, 288].map((angle) => (
            <circle key={angle} cx={0} cy={-40} r={3} transform={`rotate(${angle})`} fill="black" />
          ))}
        </mask>

        <g mask={`url(#${maskId})`}>
          <circle r="43" fill="none" stroke="currentColor" strokeWidth={9} />
          {[0, 11.25, 22.5, 33.75, 45, 56.25, 67.5, 78.75, 90, 101.25, 112.5, 123.75, 135, 146.25, 157.5, 168.75, 180, 191.25, 202.5, 213.75, 225, 236.25, 247.5, 258.75, 270, 281.25, 292.5, 303.75, 315, 326.25, 337.5, 348.75].map(
            (angle) => (
              <polygon
                key={`cog-${angle}`}
                points="46 3 51 0 46 -3"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinejoin="round"
                fill="none"
                transform={`rotate(${angle})`}
              />
            ),
          )}

          {[0, 72, 144, 216, 288].map((angle) => (
            <polygon
              key={`mount-${angle}`}
              points="-7 -42 0 -35 7 -42"
              stroke="currentColor"
              strokeWidth={6}
              strokeLinejoin="round"
              fill="none"
              transform={`rotate(${angle})`}
            />
          ))}
        </g>
      </g>
    </svg>
  );
};

export const LinkedInMark = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    {...baseProps}
    {...props}
    className={className}
    viewBox="0 0 16 16"
  >
    <path
      d="M3.5 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm1.25 4.5H2.25V13h2.5V7.5Zm2.5.006c0-1.24 1.006-2.256 2.25-2.256.6 0 1.17.24 1.58.667v-.417H13.5V13h-2.5V9.687c0-.62-.47-1.137-1.094-1.137-.62 0-1.156.517-1.156 1.137V13H6.75V7.506Z"
      fill="currentColor"
    />
    <rect x="2.25" y="5" width="2.5" height="8" fill="currentColor" opacity="0" />
  </svg>
);

export const CratesMark = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    {...baseProps}
    {...props}
    className={className}
    viewBox="0 0 20 20"
  >
    <path
      d="M3.5 5.75 10 2l6.5 3.75v7.5L10 17.5l-6.5-4.25v-7.5Z"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinejoin="round"
    />
    <path
      d="M10 9.5v8"
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinecap="round"
    />
    <path
      d="M16.5 6 10 9.5 3.5 6"
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinejoin="round"
    />
  </svg>
);

export type { SVGProps };
